import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '../api/tickets.api';
import type { TicketFilters, CreateTicketDto, UpdateTicketDto, CreateMessageDto } from '@/types/ticket.types';

export const ticketKeys = {
    all: ['tickets'] as const,
    lists: () => [...ticketKeys.all, 'list'] as const,
    list: (filters: TicketFilters) => [...ticketKeys.lists(), filters] as const,
    details: () => [...ticketKeys.all, 'detail'] as const,
    detail: (id: number) => [...ticketKeys.details(), id] as const,
};

export const useTicketsQuery = (filters: TicketFilters = {}) => {
    return useQuery({
        queryKey: ticketKeys.list(filters),
        queryFn: async () => {
            const response = await ticketsApi.getAll(filters);
            const data = response.data as any;
            return Array.isArray(data) ? data : data.results ?? [];
        },
    });
};

export const useTicketQuery = (id: number) => {
    return useQuery({
        queryKey: ticketKeys.detail(id),
        queryFn: async () => {
            const response = await ticketsApi.getById(id);
            return response.data;
        },
        enabled: !!id,
    });
};

export const useCreateTicketMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateTicketDto) => ticketsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
        },
    });
};

export const useUpdateTicketMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateTicketDto }) =>
            ticketsApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ticketKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
        },
    });
};

export const useAddMessageMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ticketId, data }: { ticketId: number; data: CreateMessageDto }) =>
            ticketsApi.addMessage(ticketId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ticketKeys.detail(variables.ticketId) });
        },
    });
};
