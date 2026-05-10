/**
 * Auth API service
 */
import apiClient from './client';
import { useAuthStore, type UserProfile } from '../store/authStore';

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  username?: string;
  otp: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthResponse extends TokenResponse {
  user?: UserProfile;
}

export const authAPI = {
  registerSendOtp: async (email: string) => {
    const { data } = await apiClient.post('/auth/register-send-otp', { email });
    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/register', payload);
    return data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/login', payload);
    return data;
  },

  socialLogin: async (firebaseToken: string, provider: 'google' | 'apple'): Promise<TokenResponse> => {
    const { data } = await apiClient.post('/auth/social-login', {
      firebase_token: firebaseToken,
      provider,
    });
    return data;
  },

  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const { data } = await apiClient.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return data;
  },

  forgotPassword: async (email: string) => {
    const { data } = await apiClient.post('/auth/forgot-password', { email });
    return data;
  },
  
  verifyResetOtp: async (email: string, otp: string) => {
    const { data } = await apiClient.post('/auth/verify-reset-otp', { email, otp });
    return data;
  },
  
  resetPassword: async (resetData: any) => {
    // resetData should contain { email, otp, new_password }
    const { data } = await apiClient.post('/auth/reset-password', resetData);
    return data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      useAuthStore.getState().logout();
    }
  },
};
