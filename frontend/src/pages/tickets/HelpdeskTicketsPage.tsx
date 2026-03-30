import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Inbox, Clock, UserCheck, MessageSquare,
} from 'lucide-react';
import { Avatar, Button, Card, Input, Select, PageLoader } from '@/components/ui';
import { StatusBadge, PriorityBadge } from '@/features/tickets/components/StatusBadge';
import { useTicketsQuery, useUpdateTicketMutation } from '@/features/tickets/hooks/useTicketsQuery';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { timeAgo } from '@/utils/date';
import { useDebounce } from '@/hooks/useDebounce';
import type { TicketStatus } from '@/types/ticket.types';

type Tab = 'queue' | 'mine' | 'all';

const HelpdeskTicketsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: ticketsData, isLoading } = useTicketsQuery();
    const updateMutation = useUpdateTicketMutation();

    const [tab, setTab] = useState<Tab>('queue');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string>('');
    const dSearch = useDebounce(search, 250);

    const tickets = useMemo(() => {
        if (!ticketsData) return [];
        return Array.isArray(ticketsData) ? ticketsData : (ticketsData as any).results || [];
    }, [ticketsData]);


    const byTab = useMemo(() => {
        if (tab === 'queue') return tickets.filter((t: any) => !t.assignedTo && t.status === 'OPEN');
        if (tab === 'mine') return tickets.filter((t: any) => t.assignedTo?.id === user?.id);
        return tickets;
    }, [tickets, tab, user]);


    const filtered = useMemo(() => {
        let list = [...byTab];
        if (status) list = list.filter((t: any) => t.status === status);
        if (dSearch) {
            const q = dSearch.toLowerCase();
            list = list.filter(
                (t: any) =>
                    t.subject.toLowerCase().includes(q) ||
                    String(t.id).includes(q) ||
                    t.creator.firstName.toLowerCase().includes(q),
            );
        }
        // Tri : critiques en premier
        list.sort((a: any, b: any) => {
            const pri: any = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
            return pri[b.priority] - pri[a.priority];
        });
        return list;
    }, [byTab, status, dSearch]);


    const handleTakeTicket = (ticketId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) return;
        updateMutation.mutate({
            id: ticketId,
            data: { assignedToId: user.id, status: 'IN_PROGRESS' as TicketStatus }
        });
    };


    const handleStatusChange = (ticketId: number, newStatus: string, e: React.ChangeEvent<HTMLSelectElement>) => {
        e.stopPropagation();
        updateMutation.mutate({
            id: ticketId,
            data: { status: newStatus as TicketStatus }
        });
    };

    const tabCounts = useMemo(() => ({
        queue: tickets.filter((t: any) => !t.assignedTo && t.status === 'OPEN').length,
        mine: tickets.filter((t: any) => t.assignedTo?.id === user?.id).length,
        all: tickets.length,
    }), [tickets, user]);

    const tabs: { key: Tab; label: string; count: number }[] = [
        { key: 'queue', label: 'File d\'attente', count: tabCounts.queue },
        { key: 'mine', label: 'Mes tickets', count: tabCounts.mine },
        { key: 'all', label: 'Tous les tickets', count: tabCounts.all },
    ];

    if (isLoading) return <PageLoader />;

    return (
        <div className="space-y-5">


            <div>
                <h1 className="font-heading text-xl font-bold text-slate-900">Tickets</h1>
                <p className="text-sm text-slate-500 mt-0.5">Gerez et traitez les demandes</p>
            </div>


            <div className="flex items-center gap-1 border-b border-slate-200">
                {tabs.map(({ key, label, count }) => (
                    <button
                        key={key}
                        onClick={() => { setTab(key); setStatus(''); setSearch(''); }}
                        className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${tab === key
                            ? 'text-primary-700 border-b-2 border-primary-600 -mb-px'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {label}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${tab === key ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                            {count}
                        </span>
                    </button>
                ))}
            </div>


            <div className="flex items-center gap-3 flex-wrap">
                <Input
                    placeholder="Rechercher…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    leftAddon={<Search className="h-4 w-4" />}
                    className="max-w-xs"
                />
                <Select
                    options={[
                        { label: 'Tous les statuts', value: '' },
                        { label: 'Ouvert', value: 'OPEN' },
                        { label: 'En cours', value: 'IN_PROGRESS' },
                        { label: 'Resolu', value: 'RESOLVED' },
                        { label: 'Ferme', value: 'CLOSED' },
                    ]}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-44"
                />
            </div>


            {filtered.length === 0 ? (
                <Card>
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                        <Inbox className="h-10 w-10 text-slate-200" />
                        <p className="font-semibold text-slate-600">
                            {tab === 'queue' ? 'File d\'attente vide ✓' : 'Aucun ticket trouvé'}
                        </p>
                        <p className="text-sm text-slate-400 max-w-xs">
                            {tab === 'queue'
                                ? 'Tous les tickets ont été pris en charge.'
                                : 'Essayez d\'ajuster les filtres.'}
                        </p>
                    </div>
                </Card>
            ) : (
                <Card padding="none">
                    <div className="divide-y divide-slate-100">
                        {filtered.map((ticket: any) => (
                            <div
                                key={ticket.id}
                                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 cursor-pointer transition-colors group"
                                onClick={() => navigate(`/tickets/${ticket.id}`)}
                            >
                                {/* Priority stripe */}
                                <div className={`h-8 w-0.5 rounded-full flex-shrink-0 ${ticket.priority === 'CRITICAL' ? 'bg-red-500' :
                                    ticket.priority === 'HIGH' ? 'bg-orange-400' :
                                        ticket.priority === 'MEDIUM' ? 'bg-primary-400' :
                                            'bg-slate-200'
                                    }`} />

                                {/* Createur */}
                                <Avatar
                                    firstName={ticket.creator.firstName}
                                    lastName={ticket.creator.lastName}
                                    size="sm"
                                    className="flex-shrink-0"
                                />

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-mono text-xs text-slate-400">#{ticket.id}</span>
                                        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-primary-700 transition-colors">
                                            {ticket.subject}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <span>{ticket.creator.firstName} {ticket.creator.lastName}</span>
                                        <span className="text-slate-200">·</span>
                                        <span>{ticket.category.name}</span>
                                        <span className="text-slate-200">·</span>
                                        <span className="flex items-center gap-1">
                                            <MessageSquare className="h-3 w-3" />
                                            {ticket.messages?.length ?? 0}
                                        </span>
                                        <span className="text-slate-200">·</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {timeAgo(ticket.updatedAt)}
                                        </span>
                                    </div>
                                </div>

                                {/* Badges */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <PriorityBadge priority={ticket.priority} />
                                    <StatusBadge status={ticket.status} />
                                </div>

                                {/* Assigne */}
                                <div className="shrink-0 w-28">
                                    {ticket.assignedTo ? (
                                        <div className="flex items-center gap-1.5">
                                            <Avatar
                                                firstName={ticket.assignedTo.firstName}
                                                lastName={ticket.assignedTo.lastName}
                                                size="xs"
                                            />
                                            <span className="text-xs text-slate-600 truncate">
                                                {ticket.assignedTo.firstName}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-xs italic text-slate-300">Non assigne</span>
                                    )}
                                </div>

                                {/* Actions rapides */}
                                <div
                                    className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Prise en charge rapide si non assigne */}
                                    {!ticket.assignedTo && (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={(e) => handleTakeTicket(ticket.id, e)}
                                            leftIcon={<UserCheck className="h-3.5 w-3.5" />}
                                        >
                                            Prendre
                                        </Button>
                                    )}

                                    {/* Changement de statut rapide si assigne a moi */}
                                    {ticket.assignedTo?.id === user?.id &&
                                        ticket.status !== 'RESOLVED' &&
                                        ticket.status !== 'CLOSED' && (
                                            <select
                                                className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-400"
                                                value={ticket.status}
                                                onChange={(e) => handleStatusChange(ticket.id, e.target.value, e)}
                                            >
                                                <option value="OPEN">Ouvert</option>
                                                <option value="IN_PROGRESS">En cours</option>
                                                <option value="RESOLVED">Resolu</option>
                                                <option value="CLOSED">Ferme</option>
                                            </select>
                                        )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default HelpdeskTicketsPage;
