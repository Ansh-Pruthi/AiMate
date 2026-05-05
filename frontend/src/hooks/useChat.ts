import { useState, useCallback } from 'react';
import * as chatService from '../services/chatService';
import { getToken } from '../utils/token';
import type { IConversation, IMessage } from '../types';

export const useChat = () => {
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string>('');

  // ─── Load all conversations ──────────────────────────────────
  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    try {
      const result = await chatService.getConversations();
      setConversations(result.conversations);
    } catch {
      setError('Failed to load conversations');
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // ─── Select a conversation + load its messages ───────────────
  const selectConversation = useCallback(async (id: string) => {
    setActiveConversationId(id);
    setMessages([]);
    setError('');
    setIsLoadingMessages(true);

    try {
      const { messages } = await chatService.getConversation(id);
      setMessages(messages);
    } catch {
      setError('Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // ─── Create new conversation ─────────────────────────────────
  const startNewConversation = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setError('');
  }, []);

  // ─── Send message + stream response ─────────────────────────
  const sendMessage = useCallback(
    async (content: string) => {
      if (isStreaming) return;
      setError('');

      let conversationId = activeConversationId;

      // Auto-create conversation if none is active
      if (!conversationId) {
        try {
          const newConv = await chatService.createConversation(
            content.slice(0, 40) // use first 40 chars as temp title
          );
          conversationId = newConv.id;
          setActiveConversationId(newConv.id);
          setConversations((prev) => [newConv, ...prev]);
        } catch {
          setError('Failed to create conversation');
          return;
        }
      }

      const token = getToken();
      if (!token) return;

      setIsStreaming(true);
      setStreamingContent('');

      try {
        const response = await chatService.streamMessage(
          conversationId,
          content,
          token
        );

        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            // SSE format: "event: xxx" then "data: xxx"
            if (line.startsWith('event: ')) {
              // handled below via data lines
              continue;
            }

            if (line.startsWith('data: ')) {
              const rawData = line.slice(6).trim();
              if (!rawData) continue;

              try {
                const parsed = JSON.parse(rawData) as {
                  text?: string;
                  userMessage?: IMessage;
                  fullContent?: string;
                  message?: string;
                };

                if (parsed.userMessage) {
                  // Add user message to list
                  setMessages((prev) => [...prev, parsed.userMessage!]);
                }

                if (parsed.text) {
                  // Append streaming chunk
                  fullContent += parsed.text;
                  setStreamingContent(fullContent);
                }

                if (parsed.fullContent !== undefined) {
                  // Stream done — replace streaming bubble with real message
                  const aiMessage: IMessage = {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: parsed.fullContent,
                    createdAt: new Date().toISOString(),
                  };
                  setMessages((prev) => [...prev, aiMessage]);
                  setStreamingContent('');

                  // Update conversation title + message count in sidebar
                  setConversations((prev) =>
                    prev.map((c) =>
                      c.id === conversationId
                        ? {
                            ...c,
                            messageCount: c.messageCount + 2,
                            lastMessageAt: new Date().toISOString(),
                          }
                        : c
                    )
                  );
                }

                if (parsed.message && !parsed.fullContent) {
                  // Error event from SSE
                  setError(parsed.message);
                  setStreamingContent('');
                }
              } catch {
                // Non-JSON line — skip
              }
            }
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to send message'
        );
        setStreamingContent('');
      } finally {
        setIsStreaming(false);
      }
    },
    [activeConversationId, isStreaming]
  );

  // ─── Delete conversation ─────────────────────────────────────
  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        await chatService.deleteConversation(id);
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeConversationId === id) {
          setActiveConversationId(null);
          setMessages([]);
        }
      } catch {
        setError('Failed to delete conversation');
      }
    },
    [activeConversationId]
  );

  return {
    conversations,
    activeConversationId,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    isStreaming,
    streamingContent,
    error,
    loadConversations,
    selectConversation,
    startNewConversation,
    sendMessage,
    deleteConversation,
  };
};