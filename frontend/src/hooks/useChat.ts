// src/hooks/useChat.ts
import { useState, useCallback } from 'react';
import * as chatService from '../services/chatService';
import { getToken } from '../utils/token';
import type { IConversation, IMessage } from '../types';

// ── Accept navigate as a param so hook stays testable ─────────
export const useChat = (navigate: (path: string) => void) => {
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string>('');

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

  const selectConversation = useCallback(async (id: string) => {
    navigate(`/chat/${id}`);           // ← update URL
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
  }, [navigate]);

  const startNewConversation = useCallback(() => {
    navigate('/');                     // ← go back to home
    setActiveConversationId(null);
    setMessages([]);
    setError('');
  }, [navigate]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isStreaming) return;
      setError('');

      let conversationId = activeConversationId;

      if (!conversationId) {
        try {
          const newConv = await chatService.createConversation(
            content.slice(0, 40)
          );
          conversationId = newConv.id;
          setActiveConversationId(newConv.id);
          setConversations((prev) => [newConv, ...prev]);
          navigate(`/chat/${newConv.id}`);   // ← navigate to new conversation URL
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
            if (line.startsWith('event: ')) continue;

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
                  setMessages((prev) => [...prev, parsed.userMessage!]);
                }

                if (parsed.text) {
                  fullContent += parsed.text;
                  setStreamingContent(fullContent);
                }

                if (parsed.fullContent !== undefined) {
                  const aiMessage: IMessage = {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: parsed.fullContent,
                    createdAt: new Date().toISOString(),
                  };
                  setMessages((prev) => [...prev, aiMessage]);
                  setStreamingContent('');
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
                  setError(parsed.message);
                  setStreamingContent('');
                }
              } catch {
                // skip non-JSON
              }
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
        setStreamingContent('');
      } finally {
        setIsStreaming(false);
      }
    },
    [activeConversationId, isStreaming, navigate]
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        await chatService.deleteConversation(id);
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeConversationId === id) {
          startNewConversation();        // ← navigate to / on delete
        }
      } catch {
        setError('Failed to delete conversation');
      }
    },
    [activeConversationId, startNewConversation]
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