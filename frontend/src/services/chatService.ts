import api from "./api";
import type {
  IConversation,
  IMessage,
  IPaginatedConversations,
} from "../types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Create a new conversation ────────────────────────────────
export const createConversation = async (
  title?: string,
): Promise<IConversation> => {
  const { data } = await api.post<ApiResponse<IConversation>>(
    "/chat/conversations",
    { title: title ?? "New Conversation", model: "gemini-2.5-flash-lite" },
  );
  return data.data;
};

// ─── Fetch all conversations ──────────────────────────────────
export const getConversations = async (
  page = 1,
  limit = 20,
): Promise<IPaginatedConversations> => {
  const { data } = await api.get<ApiResponse<IPaginatedConversations>>(
    `/chat/conversations?page=${page}&limit=${limit}`,
  );
  return data.data;
};

// ─── Fetch one conversation + its messages ────────────────────
export const getConversation = async (
  id: string,
): Promise<{ conversation: IConversation; messages: IMessage[] }> => {
  const { data } = await api.get<
    ApiResponse<{ conversation: IConversation; messages: IMessage[] }>
  >(`/chat/conversations/${id}`);
  return data.data;
};

// ─── Delete a conversation ────────────────────────────────────
export const deleteConversation = async (id: string): Promise<void> => {
  await api.delete(`/chat/conversations/${id}`);
};

// ─── Stream a message — returns a ReadableStream via fetch ────
// We use raw fetch here (not axios) because axios doesn't support
// streaming responses in the browser
export const streamMessage = (
  conversationId: string,
  content: string,
  token: string,
): Promise<Response> => {
  return fetch(
    `${import.meta.env.VITE_API_URL}/chat/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({ content }),
    },
  );
};
