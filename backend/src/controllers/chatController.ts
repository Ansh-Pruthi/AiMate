import { Request, Response, NextFunction } from 'express';
import * as chatService from '../services/chatService';
import { streamGeminiResponse } from '../services/geminiService';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { ICreateConversationInput, ISendMessageInput } from '../types';

// CREATE CONVERSATION 
export const createConversation = async (
  req: Request<object, object, ICreateConversationInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const conversation = await chatService.createConversation(userId, req.body);
    sendSuccess(res, 201, 'Conversation created', conversation);
  } catch (error) {
    next(error);
  }
};

// LIST CONVERSATIONS 
export const getConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 20;

    const result = await chatService.getUserConversations(userId, page, limit);
    sendSuccess(res, 200, 'Conversations fetched', result);
  } catch (error) {
    next(error);
  }
};

// GET ONE CONVERSATION 
export const getConversation = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const result = await chatService.getConversationWithMessages(id, userId);
    sendSuccess(res, 200, 'Conversation fetched', result);
  } catch (error) {
    next(error);
  }
};

// SEND MESSAGE (STREAMING) 
export const sendMessage = async (
  req: Request<{ id: string }, object, ISendMessageInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user!.userId;
  const { id: conversationId } = req.params;
  const { content } = req.body;

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    sendError(res, 422, 'Message content is required');
    return;
  }

  if (content.length > 32000) {
    sendError(res, 422, 'Message too long (max 32,000 characters)');
    return;
  }

  // Set SSE headers 
  // This turns the HTTP response into a stream
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering
  res.flushHeaders();                        // Send headers immediately

  // SSE helper functions 
  const sendSSEEvent = (event: string, data: unknown): void => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  let fullAIResponse = '';
  let hasError = false;

  try {
    // 1. Save user message, get history
    const { conversation, userMessage, geminiHistory } =
      await chatService.prepareMessageSend(conversationId, userId, content.trim());

    // 2. Confirm to client: user message saved, streaming starts
    sendSSEEvent('message_saved', {
      userMessage: {
        id: userMessage._id.toString(),
        role: 'user',
        content: userMessage.content,
        createdAt: userMessage.createdAt,
      },
    });

    // 3. Stream Gemini response chunk by chunk
    const stream = streamGeminiResponse(
      geminiHistory,
      content.trim(),
      conversation.model
    );

    for await (const chunk of stream) {
      fullAIResponse += chunk;

      // Send each chunk to client immediately
      sendSSEEvent('chunk', { text: chunk });
    }

    // 4. Save complete AI response to DB
    await chatService.finalizeAIMessage(
      conversationId,
      userId,
      fullAIResponse,
      false
    );

    // 5. Signal stream end with complete message
    sendSSEEvent('done', {
      fullContent: fullAIResponse,
    });

  } catch (error) {
    hasError = true;

    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    // Save error message to DB so user sees it in history
    if (fullAIResponse.length > 0 || hasError) {
      try {
        await chatService.finalizeAIMessage(
          conversationId,
          userId,
          fullAIResponse.length > 0
            ? fullAIResponse
            : `Error: ${errorMessage}`,
          true
        );
      } catch {
        // Don't throw here — we're already in error handling
      }
    }

    // Send error over SSE (not next(error) — headers already sent)
    sendSSEEvent('error', { message: errorMessage });
  } finally {
    // Always close the stream
    res.end();
  }
};

// DELETE CONVERSATION 
export const deleteConversation = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    await chatService.deleteConversation(id, userId);
    sendSuccess(res, 200, 'Conversation deleted', null);
  } catch (error) {
    next(error);
  }
};