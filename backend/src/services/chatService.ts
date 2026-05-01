import mongoose from "mongoose";
import Conversation, { IConversation } from "../models/Conversation";
import Message, { IMessage } from "../models/Message";
import { formatMessagesForGemini, generateTitle } from "./geminiService";
import {
  IConversationResponse,
  ICreateConversationInput,
  IMessageResponse,
  IGeminiMessage,
} from "../types";

// Custom error
export class ChatError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, ChatError.prototype);
  }
}

// Shape a conversation for API response
const formatConversation = (conv: IConversation): IConversationResponse => ({
  id: conv._id.toString(),
  title: conv.title,
  model: conv.model,
  messageCount: conv.messageCount,
  lastMessageAt: conv.lastMessageAt,
  createdAt: conv.createdAt,
});

// Shape a message for API response
const formatMessage = (message: IMessage): IMessageResponse => ({
  id: message._id.toString(),
  role: message.role,
  content: message.content,
  tokens: message.tokens,
  createdAt: message.createdAt,
});

// CREATE CONVERSATION
export const createConversation = async (
  userId: string,
  input: ICreateConversationInput,
): Promise<IConversationResponse> => {
  const conversation = await Conversation.create({
    userId: new mongoose.Types.ObjectId(userId),
    title: input.title ?? "New Conversation",
    model: input.model ?? "gemini-2.0-flash",
  });
  return formatConversation(conversation);
};

// List Conversations
export const getUserConversations = async (
  userId: string,
  page: number = 1,
  limit: number = 20,
): Promise<{
  conversations: IConversationResponse[];
  total: number;
  hasMore: boolean;
}> => {
  const skip = (page - 1) * limit;

  const [conversations, total] = await Promise.all([
    Conversation.find({ userId, isActive: true })
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Conversation.countDocuments({ userId, isActive: true }),
  ]);
  return {
    conversations: conversations.map((c) => ({
      id: c._id.toString(),
      title: c.title,
      model: c.model,
      messageCount: c.messageCount,
      lastMessageAt: c.lastMessageAt,
      createdAt: c.createdAt,
    })),
    total,
    hasMore: skip + conversations.length < total,
  };
};

// GET ONE CONVERSATION + MESSAGES
export const getConversationWithMessages = async (
  conversationId: string,
  userId: string,
): Promise<{
  conversation: IConversationResponse;
  messages: IMessageResponse[];
}> => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    userId,
    isActive: true,
  });

  if (!conversation) {
    throw new ChatError("Conversation not found", 404);
  }

  const messages = await Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .lean();

  return {
    conversation: formatConversation(conversation),
    messages: messages.map((msg) => ({
      id: msg._id.toString(),
      role: msg.role,
      content: msg.content,
      tokens: msg.tokens,
      createdAt: msg.createdAt,
    })),
  };
};

// PREPARE MESSAGE SEND
// Saves user message and returns history for Gemini
export const prepareMessageSend = async (
  conversationId: string,
  userId: string,
  userContent: string,
): Promise<{
  conversation: IConversation;
  userMessage: IMessage;
  geminiHistory: IGeminiMessage[];
}> => {
  // 1. Verify conversation belongs to user
  const conversation = await Conversation.findOne({
    _id: conversationId,
    userId,
    isActive: true,
  });

  if (!conversation) {
    throw new ChatError("Conversation not found", 404);
  }

  // 2. Get existing messages for history context
  const existingMessages = await Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .lean();

  // 3. Save user message first
  const userMessage = await Message.create({
    conversationId,
    userId,
    role: "user",
    content: userContent,
  });

  // 4. Format history for Gemini (exclude the message we just saved)
  const geminiHistory = formatMessagesForGemini(
    existingMessages.map((m) => ({ role: m.role, content: m.content })),
  );

  return { conversation, userMessage, geminiHistory };
};

// FINALIZE AI MESSAGE
// Called after streaming completes
export const finalizeAIMessage = async (
  conversationId: string,
  userId: string,
  fullContent: string,
  isError: boolean = false,
): Promise<void> => {
  const isFirstMessage =
    (await Message.countDocuments({ conversationId, role: "assistant" })) === 0;

  // Save the complete AI message
  await Message.create({
    conversationId,
    userId,
    role: "assistant",
    content: fullContent,
    isError,
  });

  // Update conversation metadata
  const updateData: Partial<IConversation> = {
    lastMessageAt: new Date(),
    messageCount: await Message.countDocuments({ conversationId }),
  };

  // Auto-generate title from first AI response
  if (isFirstMessage && !isError) {
    const userMsg = await Message.findOne({ conversationId, role: 'user' })
      .sort({ createdAt: 1 })
      .lean();

    if (userMsg) {
      updateData.title = await generateTitle(userMsg.content);
    }
  }

  await Conversation.findByIdAndUpdate(conversationId, updateData);
};

// SOFT DELETE 
export const deleteConversation = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    userId,
    isActive: true,
  });

  if (!conversation) {
    throw new ChatError('Conversation not found', 404);
  }

  // Soft delete: keep data, just hide it
  await Conversation.findByIdAndUpdate(conversationId, { isActive: false });
};