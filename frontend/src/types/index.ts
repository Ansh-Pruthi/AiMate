export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface IAuthResponse {
  user: IUser;
  accessToken: string;
}

export interface IConversation {
  id: string;
  title: string;
  model: string;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
}

export interface IMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IRegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface IPaginatedConversations {
  conversations: IConversation[];
  total: number;
  hasMore: boolean;
}