import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input, Select } from '@/components/ui';
import type { TicketFilters } from '@/types/ticket.types';
import { useCategoriesQuery } from '@/features/categories/hooks/useCategoriesQuery';

interface Props {
  filters: TicketFilters;
  onChange: (filters: TicketFilters) => void;
}

export const TicketFiltersBar: React.FC<Props> = ({ filters, onChange }) => {
  const { data: categories = [] } = useCategoriesQuery();

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-48">
        <Input
          placeholder="Rechercher un ticket…"
          value={filters.search ?? ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          leftAddon={<Search className="h-4 w-4" />}
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <Select
          options={[
            { label: 'Tous les statuts', value: '' },
            { label: 'Ouvert', value: 'OPEN' },
            { label: 'En cours', value: 'IN_PROGRESS' },
            { label: 'Résolu', value: 'RESOLVED' },
            { label: 'Fermé', value: 'CLOSED' },
          ]}
          value={filters.status ?? ''}
          onChange={(e) => onChange({ ...filters, status: e.target.value as TicketFilters['status'] || undefined })}
          className="w-40"
        />
        <Select
          options={[
            { label: 'Toutes priorités', value: '' },
            { label: 'Critique', value: 'CRITICAL' },
            { label: 'Élevé', value: 'HIGH' },
            { label: 'Moyen', value: 'MEDIUM' },
            { label: 'Faible', value: 'LOW' },
          ]}
          value={filters.priority ?? ''}
          onChange={(e) => onChange({ ...filters, priority: e.target.value as TicketFilters['priority'] || undefined })}
          className="w-40"
        />
        <Select
          options={[
            { label: 'Toutes catégories', value: '' },
            ...categories.map((c: any) => ({ label: c.name, value: c.id })),
          ]}
          value={filters.categoryId ?? ''}
          onChange={(e) => onChange({ ...filters, categoryId: e.target.value ? Number(e.target.value) : undefined })}
          className="w-44"
        />
      </div>
    </div>
  );
};
