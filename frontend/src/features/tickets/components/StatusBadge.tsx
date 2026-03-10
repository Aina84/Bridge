import React from 'react';
import { Badge } from '@/components/ui';
import { TICKET_STATUS_LABELS, TICKET_PRIORITY_LABELS } from '@/config/constants';
import { getStatusBadgeVariant, getPriorityBadgeVariant } from '@/utils/ticket.utils';
import type { TicketStatus, TicketPriority } from '@/types/ticket.types';

export const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => (
  <Badge variant={getStatusBadgeVariant(status)} dot>
    {TICKET_STATUS_LABELS[status]}
  </Badge>
);

export const PriorityBadge: React.FC<{ priority: TicketPriority }> = ({ priority }) => (
  <Badge variant={getPriorityBadgeVariant(priority)}>
    {TICKET_PRIORITY_LABELS[priority]}
  </Badge>
);
