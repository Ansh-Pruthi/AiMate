export interface IUserPayload{
    userId: string,
    email: string,
    role: 'user' | 'admin'
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface IRegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
  };
  accessToken: string;
}

export interface IGeminiMessage {
  role: "user" | 'model',
  parts: Array<{ text: string }>
}

export interface ICreateConversationInput {
  title?: string,
  model?: string
}

export interface ISendMessageInput {
  content: string;
}

export interface IConversationResponse {
  id: string;
  title: string;
  model: string;
  messageCount: number;
  lastMessageAt: Date;
  createdAt: Date;
}

export interface IMessageResponse {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens?: number;
  createdAt: Date;
}