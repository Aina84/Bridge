import axiosInstance from '@/api/axios';
import type { Ticket, CreateTicketDto, UpdateTicketDto, CreateMessageDto, TicketFilters, TicketMessage } from '@/types/ticket.types';
import type { PaginatedResponse } from '@/types/common.types';

export const ticketsApi = {
  getAll: (filters?: TicketFilters) =>
    axiosInstance.get<PaginatedResponse<Ticket>>('tickets/', { params: filters }),

  getById: (id: number) =>
    axiosInstance.get<Ticket>(`tickets/${id}/`),

  create: (data: CreateTicketDto) => {
    const formData = new FormData();
    formData.append('subject', data.subject);
    formData.append('description', data.description);
    formData.append('priority', data.priority);
    formData.append('categoryId', String(data.categoryId));
    data.attachments?.forEach((file) => formData.append('attachments', file));
    return axiosInstance.post<Ticket>('tickets/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  update: (id: number, data: UpdateTicketDto) =>
    axiosInstance.patch<Ticket>(`tickets/${id}/`, data),

  delete: (id: number) =>
    axiosInstance.delete(`tickets/${id}/`),

  addMessage: (ticketId: number, data: CreateMessageDto) => {
    const formData = new FormData();
    formData.append('content', data.content);
    data.attachments?.forEach((file) => formData.append('attachments', file));
    return axiosInstance.post<TicketMessage>(`tickets/${ticketId}/messages/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
