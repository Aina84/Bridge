// src/features/categories/hooks/useCategoriesQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../api/categories.api';

export const categoryKeys = {
    all: ['categories'] as const,
};

export const useCategoriesQuery = () => {
    return useQuery({
        queryKey: categoryKeys.all,
        queryFn: async () => {
            const response = await categoriesApi.getAll();
            return Array.isArray(response.data) ? response.data : (response.data as any).results;
        },
    });
};

export const useCreateCategoryMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string; description?: string }) => categoriesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.all });
        },
    });
};

export const useDeleteCategoryMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => categoriesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.all });
        },
    });
};
