import axiosInstance from '@/api/axios';
import type { User } from '@/types/auth.types';
import type { CreateUserDto, UpdateUserDto } from '@/types/user.types';
import type { PaginatedResponse } from '@/types/common.types';

export const usersApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    axiosInstance.get<PaginatedResponse<User>>('users/', { params }),

  getById: (id: number) => axiosInstance.get<User>(`users/${id}/`),

  create: (data: CreateUserDto) => axiosInstance.post<User>('users/', data),

  update: (id: number, data: UpdateUserDto) =>
    axiosInstance.patch<User>(`users/${id}/`, data),

  delete: (id: number) => axiosInstance.delete(`users/${id}/`),
};
