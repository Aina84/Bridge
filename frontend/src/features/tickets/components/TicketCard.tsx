import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, User } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { timeAgo } from '@/utils/date';
import type { Ticket } from '@/types/ticket.types';
import { StatusBadge, PriorityBadge } from './StatusBadge';

interface TicketCardProps {
  ticket: Ticket;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const navigate = useNavigate();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/tickets/${ticket.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/tickets/${ticket.id}`)}
      className="group relative flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-primary-300 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Priority stripe */}
      <div
        className={`absolute left-0 top-0 h-full w-0.5 rounded-l-xl ${ticket.priority === 'CRITICAL' ? 'bg-red-500' :
            ticket.priority === 'HIGH' ? 'bg-amber-500' :
              ticket.priority === 'MEDIUM' ? 'bg-primary-500' :
                'bg-slate-200'
          }`}
      />

      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-slate-400">#{ticket.id}</p>
          <h3 className="mt-0.5 text-sm font-semibold text-slate-900 group-hover:text-primary-700 transition-colors line-clamp-2">
            {ticket.subject}
          </h3>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      <p className="text-xs text-slate-500 line-clamp-2">{ticket.description}</p>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
          {ticket.category?.name || 'Sans catégorie'}
        </span>
        <PriorityBadge priority={ticket.priority} />
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          {timeAgo(ticket.updatedAt)}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <MessageSquare className="h-3.5 w-3.5" />
            {ticket.messages?.length ?? 0}
          </span>
          {ticket.assignedTo ? (
            <Avatar
              firstName={ticket.assignedTo.firstName}
              lastName={ticket.assignedTo.lastName}
              size="xs"
            />
          ) : (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <User className="h-3.5 w-3.5" />
              Non assigné
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
