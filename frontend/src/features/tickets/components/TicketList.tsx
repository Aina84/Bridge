import React from 'react';
import { Ticket as TicketIcon } from 'lucide-react';
import { EmptyState } from '@/components/ui';
import type { Ticket } from '@/types/ticket.types';
import { TicketCard } from './TicketCard';

interface Props {
  tickets: Ticket[];
  isLoading?: boolean;
}

export const TicketList: React.FC<Props> = ({ tickets, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl border border-slate-200 bg-slate-50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <EmptyState
        icon={<TicketIcon className="h-6 w-6" />}
        title="Aucun ticket trouvé"
        description="Essayez d'ajuster les filtres ou créez un nouveau ticket."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
};
