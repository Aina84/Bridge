// src/features/categories/api/categories.api.ts
import axiosInstance from '@/api/axios';
import type { Category } from '@/types/ticket.types';

export const categoriesApi = {
  getAll: () => axiosInstance.get<Category[]>('categories/'),
  create: (data: { name: string; description?: string; color?: string }) =>
    axiosInstance.post<Category>('categories/', data),
  update: (id: number, data: Partial<{ name: string; description: string; color: string }>) =>
    axiosInstance.patch<Category>(`categories/${id}/`, data),
  delete: (id: number) => axiosInstance.delete(`categories/${id}/`),
};
