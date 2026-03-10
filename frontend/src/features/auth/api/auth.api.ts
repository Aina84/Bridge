// src/features/auth/api/auth.api.ts
import axiosInstance from '@/api/axios';
import type { LoginCredentials, RegisterCredentials, AuthTokens, User } from '@/types/auth.types';

export const authApi = {
  login: (credentials: LoginCredentials) =>
    axiosInstance.post<{ user: User; tokens: AuthTokens }>('auth/login/', credentials),

  register: (credentials: RegisterCredentials) =>
    axiosInstance.post<{ user: User; tokens: AuthTokens }>('auth/register/', credentials),

  logout: () => axiosInstance.post('auth/logout/'),

  me: () => axiosInstance.get<User>('auth/me/'),

  refreshToken: (refreshToken: string) =>
    axiosInstance.post<AuthTokens>('auth/refresh/', { refreshToken }),
};
