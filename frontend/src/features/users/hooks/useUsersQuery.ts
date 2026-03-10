// src/features/users/hooks/useUsersQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users.api';
import type { CreateUserDto, UpdateUserDto } from '@/types/user.types';

export const userKeys = {
    all: ['users'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
    helpdesk: () => [...userKeys.all, 'helpdesk'] as const,
    detail: (id: number) => [...userKeys.all, 'detail', id] as const,
};

export const useUsersQuery = () => {
    return useQuery({
        queryKey: userKeys.lists(),
        queryFn: async () => {
            const response = await usersApi.getAll();
            const data = response.data as any;
            return Array.isArray(data) ? data : data.results ?? [];
        },
    });
};

export const useHelpdeskUsersQuery = () => {
    return useQuery({
        queryKey: userKeys.helpdesk(),
        queryFn: async () => {
            const response = await usersApi.getAll();
            const data = response.data as any;
            const users = Array.isArray(data) ? data : data.results ?? [];
            return users.filter((u: any) => u.role === 'HELPDESK' || u.role === 'ADMIN');
        },
    });
};

export const useCreateUserMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateUserDto) => usersApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
    });
};

export const useUpdateUserMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) => usersApi.update(id, data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            queryClient.invalidateQueries({ queryKey: userKeys.detail(response.data.id) });
        },
    });
};

export const useDeleteUserMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => usersApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
    });
};
