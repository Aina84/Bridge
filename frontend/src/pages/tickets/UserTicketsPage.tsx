import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import { TicketList } from '@/features/tickets/components/TicketList';
import { TicketFiltersBar } from '@/features/tickets/components/TicketFilters';
import { useTicketsQuery } from '@/features/tickets/hooks/useTicketsQuery';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { TicketFilters } from '@/types/ticket.types';
import { useDebounce } from '@/hooks/useDebounce';

const TicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState<TicketFilters>({});
  const debouncedSearch = useDebounce(filters.search ?? '', 300);


  const queryFilters = useMemo(() => {
    const f: TicketFilters = { ...filters };
    if (debouncedSearch) {
      f.search = debouncedSearch;
    }
    return f;
  }, [filters, debouncedSearch]);

  const { data: ticketsData, isLoading } = useTicketsQuery(queryFilters);
  const ticketsList = ticketsData || [];


  const filtered = useMemo(() => {
    let list = user?.role === 'USER'
      ? ticketsList.filter((t: any) => t.creator?.id === user.id)
      : ticketsList;

    return list;
  }, [ticketsList, user]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-slate-900">Tickets</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {filtered.length} ticket{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        {user?.role === 'USER' && (
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => navigate('/tickets/new')}
          >
            Nouveau
          </Button>
        )}
      </div>

      <TicketFiltersBar filters={filters} onChange={setFilters} />

      <TicketList tickets={filtered} isLoading={isLoading} />
    </div>
  );
};

export default TicketsPage;
