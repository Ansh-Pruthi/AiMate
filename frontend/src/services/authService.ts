// src/services/authService.ts
import api from './api';
import axios from 'axios';                          // ← ADD
import type { IAuthResponse, ILoginInput, IRegisterInput } from '../types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const login = async (input: ILoginInput): Promise<IAuthResponse> => {
  try {
    const { data } = await api.post<ApiResponse<IAuthResponse>>('/auth/login', input);
    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Extract the message from your backend's response body
      throw new Error(error.response?.data?.message ?? 'Login failed. Please try again.', { cause: error });
    }
    throw new Error('Login failed. Please try again.', { cause: error });
  }
};

export const register = async (input: IRegisterInput): Promise<IAuthResponse> => {
  try {
    const { data } = await api.post<ApiResponse<IAuthResponse>>('/auth/register', input);
    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message ?? 'Registration failed. Please try again.', { cause: error });
    }
    throw new Error('Registration failed. Please try again.', { cause: error });
  }
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const refreshToken = async (): Promise<string> => {
  const { data } = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');
  return data.data.accessToken;
};