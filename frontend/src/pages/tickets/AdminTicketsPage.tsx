import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, ChevronDown, ChevronUp,
    Clock, MessageSquare,
} from 'lucide-react';
import { Avatar, Button, Input, Select, Card, PageLoader } from '@/components/ui';
import { StatusBadge, PriorityBadge } from '@/features/tickets/components/StatusBadge';
import { useTicketsQuery, useUpdateTicketMutation } from '@/features/tickets/hooks/useTicketsQuery';
import { useUsersQuery } from '@/features/users/hooks/useUsersQuery';
import { useCategoriesQuery } from '@/features/categories/hooks/useCategoriesQuery';
import { timeAgo } from '@/utils/date';
import type { TicketStatus, TicketPriority, TicketFilters } from '@/types/ticket.types';
import { useDebounce } from '@/hooks/useDebounce';

type SortField = 'updatedAt' | 'createdAt' | 'priority' | 'status';
type SortDir = 'asc' | 'desc';

const PRIORITY_ORDER: Record<TicketPriority, number> = {
    CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1,
};
const STATUS_ORDER: Record<TicketStatus, number> = {
    OPEN: 4, IN_PROGRESS: 3, RESOLVED: 2, CLOSED: 1,
};

const AdminTicketsPage: React.FC = () => {
    const navigate = useNavigate();

    const { data: ticketsData, isLoading: ticketsLoading } = useTicketsQuery();
    const { data: usersData, isLoading: usersLoading } = useUsersQuery();
    const { data: categoriesData, isLoading: categoriesLoading } = useCategoriesQuery();
    const updateMutation = useUpdateTicketMutation();

    const [filters, setFilters] = useState<TicketFilters>({});
    const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({
        field: 'updatedAt', dir: 'desc',
    });
    const dSearch = useDebounce(filters.search ?? '', 250);

    const tickets = useMemo(() => {
        if (!ticketsData) return [];
        return Array.isArray(ticketsData) ? ticketsData : (ticketsData as any).results || [];
    }, [ticketsData]);

    const users = usersData || [];
    const categories = categoriesData || [];

    const agents = useMemo(
        () => users.filter((u: any) => u.role === 'HELPDESK' || u.role === 'ADMIN'),
        [users],
    );


    const filtered = useMemo(() => {
        let list = [...tickets];
        if (filters.status) list = list.filter((t: any) => t.status === filters.status);
        if (filters.priority) list = list.filter((t: any) => t.priority === filters.priority);
        if (filters.categoryId) list = list.filter((t: any) => t.category.id === filters.categoryId);
        if (filters.assignedToId !== undefined) {
            list = filters.assignedToId === 0
                ? list.filter((t: any) => !t.assignedTo)
                : list.filter((t: any) => t.assignedTo?.id === filters.assignedToId);
        }
        if (dSearch) {
            const q = dSearch.toLowerCase();
            list = list.filter(
                (t: any) =>
                    t.subject.toLowerCase().includes(q) ||
                    String(t.id).includes(q) ||
                    t.creator.email.toLowerCase().includes(q),
            );
        }
        // Tri
        list.sort((a: any, b: any) => {
            let cmp = 0;
            if (sort.field === 'updatedAt') cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
            if (sort.field === 'createdAt') cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sort.field === 'priority') cmp = PRIORITY_ORDER[a.priority as TicketPriority] - PRIORITY_ORDER[b.priority as TicketPriority];
            if (sort.field === 'status') cmp = STATUS_ORDER[a.status as TicketStatus] - STATUS_ORDER[b.status as TicketStatus];
            return sort.dir === 'desc' ? -cmp : cmp;
        });
        return list;
    }, [tickets, filters.status, filters.priority, filters.categoryId, filters.assignedToId, dSearch, sort]);

    const toggleSort = (field: SortField) => {
        setSort((s) =>
            s.field === field
                ? { field, dir: s.dir === 'desc' ? 'asc' : 'desc' }
                : { field, dir: 'desc' },
        );
    };

    const SortIcon = ({ field }: { field: SortField }) =>
        sort.field === field ? (
            sort.dir === 'desc'
                ? <ChevronDown className="h-3 w-3 text-primary-600" />
                : <ChevronUp className="h-3 w-3 text-primary-600" />
        ) : (
            <ChevronDown className="h-3 w-3 text-slate-300" />
        );

    if (ticketsLoading || usersLoading || categoriesLoading) return <PageLoader />;

    return (
        <div className="space-y-5">


            <div className="flex items-start justify-between">
                <div>
                    <h1 className="font-heading text-xl font-bold text-slate-900">Tous les tickets</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {filtered.length} ticket{filtered.length !== 1 ? 's' : ''} affiche{filtered.length !== 1 ? 's' : ''}
                        {' / '}{tickets.length} au total
                    </p>
                </div>
            </div>


            <Card>
                <div className="flex flex-wrap items-end gap-3">
                    <div className="flex-1 min-w-40">
                        <Input
                            placeholder="Rechercher (sujet, id, email)…"
                            value={filters.search ?? ''}
                            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                            leftAddon={<Search className="h-4 w-4" />}
                        />
                    </div>
                    <Select
                        options={[
                            { label: 'Tous les statuts', value: '' },
                            { label: 'Ouvert', value: 'OPEN' },
                            { label: 'En cours', value: 'IN_PROGRESS' },
                            { label: 'Resolu', value: 'RESOLVED' },
                            { label: 'Ferme', value: 'CLOSED' },
                        ]}
                        value={filters.status ?? ''}
                        onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as TicketStatus || undefined }))}
                        className="w-44"
                    />
                    <Select
                        options={[
                            { label: 'Toutes priorites', value: '' },
                            { label: 'Critique', value: 'CRITICAL' },
                            { label: 'Eleve', value: 'HIGH' },
                            { label: 'Moyen', value: 'MEDIUM' },
                            { label: 'Faible', value: 'LOW' },
                        ]}
                        value={filters.priority ?? ''}
                        onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value as TicketPriority || undefined }))}
                        className="w-40"
                    />
                    <Select
                        options={[
                            { label: 'Toutes categories', value: '' },
                            ...categories.map((c: any) => ({ label: c.name, value: String(c.id) })),
                        ]}
                        value={filters.categoryId ? String(filters.categoryId) : ''}
                        onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-44"
                    />
                    <Select
                        options={[
                            { label: 'Tous les agents', value: '' },
                            { label: 'Non assigne', value: '0' },
                            ...agents.map((a: any) => ({ label: `${a.firstName} ${a.lastName}`, value: String(a.id) })),
                        ]}
                        value={filters.assignedToId !== undefined ? String(filters.assignedToId) : ''}
                        onChange={(e) => setFilters((f) => ({
                            ...f,
                            assignedToId: e.target.value !== '' ? Number(e.target.value) : undefined,
                        }))}
                        className="w-44"
                    />
                    {Object.values(filters).some((v) => v !== undefined && v !== '') && (
                        <Button
                            variant="ghost" size="sm"
                            onClick={() => setFilters({})}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            Reinitialiser
                        </Button>
                    )}
                </div>
            </Card>


            <Card padding="none">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 w-12">#</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Sujet</th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 cursor-pointer hover:text-slate-700 select-none"
                                    onClick={() => toggleSort('status')}
                                >
                                    <span className="flex items-center gap-1">Statut <SortIcon field="status" /></span>
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 cursor-pointer hover:text-slate-700 select-none"
                                    onClick={() => toggleSort('priority')}
                                >
                                    <span className="flex items-center gap-1">Priorite <SortIcon field="priority" /></span>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Assigne a</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Createur</th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 cursor-pointer hover:text-slate-700 select-none"
                                    onClick={() => toggleSort('updatedAt')}
                                >
                                    <span className="flex items-center gap-1">Activite <SortIcon field="updatedAt" /></span>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 w-32">Assigner</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">
                                        Aucun ticket ne correspond aux filtres
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((ticket: any) => (
                                    <tr key={ticket.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-4 py-3 text-slate-400 font-mono text-xs">#{ticket.id}</td>
                                        <td className="px-4 py-3 max-w-xs">
                                            <div>
                                                <button
                                                    className="text-sm font-medium text-slate-900 hover:text-primary-700 text-left line-clamp-1 transition-colors"
                                                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                                                >
                                                    {ticket.subject}
                                                </button>
                                                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                                                    <span>{ticket.category.name}</span>
                                                    <span className="text-slate-200">·</span>
                                                    <span className="flex items-center gap-1">
                                                        <MessageSquare className="h-3 w-3" />
                                                        {ticket.messages?.length ?? 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
                                        <td className="px-4 py-3"><PriorityBadge priority={ticket.priority} /></td>
                                        <td className="px-4 py-3">
                                            {ticket.assignedTo ? (
                                                <div className="flex items-center gap-2">
                                                    <Avatar
                                                        firstName={ticket.assignedTo.firstName}
                                                        lastName={ticket.assignedTo.lastName}
                                                        size="xs"
                                                    />
                                                    <span className="text-xs text-slate-600">
                                                        {ticket.assignedTo.firstName}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-300 italic">Non assigne</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Avatar
                                                    firstName={ticket.creator.firstName}
                                                    lastName={ticket.creator.lastName}
                                                    size="xs"
                                                />
                                                <span className="text-xs text-slate-600">{ticket.creator.firstName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {timeAgo(ticket.updatedAt)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-400 w-32"
                                                value={ticket.assignedTo?.id ?? ''}
                                                onChange={(e) => {
                                                    const assignedToId = e.target.value ? Number(e.target.value) : null;
                                                    updateMutation.mutate({
                                                        id: ticket.id,
                                                        data: { assignedToId: assignedToId as any }
                                                    });
                                                }}
                                            >
                                                <option value="">Non assigne</option>
                                                {agents.map((a: any) => (
                                                    <option key={a.id} value={a.id}>
                                                        {a.firstName} {a.lastName}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AdminTicketsPage;
