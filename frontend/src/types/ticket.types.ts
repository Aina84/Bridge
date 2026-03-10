import type { User } from './auth.types';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
}

export interface Attachment {
  id: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  createdAt: string;
}

export interface TicketMessage {
  id: number;
  ticketId: number;
  author: User;
  content: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: number;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: Category;
  creator: User;
  assignedTo?: User;
  messages?: TicketMessage[];
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CreateTicketDto {
  subject: string;
  description: string;
  priority: TicketPriority;
  categoryId: number;
  attachments?: File[];
}

export interface UpdateTicketDto {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedToId?: number;
  categoryId?: number;
}

export interface CreateMessageDto {
  content: string;
  attachments?: File[];
}

export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  categoryId?: number;
  assignedToId?: number;
  search?: string;
  page?: number;
  limit?: number;
}
