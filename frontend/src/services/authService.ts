import api from './api';
import {type IAuthResponse, type ILoginInput, type IRegisterInput } from '../types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const login = async (input: ILoginInput): Promise<IAuthResponse> => {
  const { data } = await api.post<ApiResponse<IAuthResponse>>('/auth/login', input);
  return data.data;
};

export const register = async (input: IRegisterInput): Promise<IAuthResponse> => {
  const { data } = await api.post<ApiResponse<IAuthResponse>>('/auth/register', input);
  return data.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const refreshToken = async (): Promise<string> => {
  const { data } = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');
  return data.data.accessToken;
};