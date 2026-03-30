import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Ticket, AlertCircle,
    ArrowRight, Tag, Headphones,
    ShieldCheck, BarChart2, Activity,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, Badge, Button, Avatar, PageLoader } from '@/components/ui';
import { StatusBadge, PriorityBadge } from '@/features/tickets/components/StatusBadge';
import { useTicketsQuery } from '@/features/tickets/hooks/useTicketsQuery';
import { useUsersQuery } from '@/features/users/hooks/useUsersQuery';
import { useCategoriesQuery } from '@/features/categories/hooks/useCategoriesQuery';
import { timeAgo } from '@/utils/date';
import type { Ticket as TicketType, TicketStatus, TicketPriority } from '@/types/ticket.types';
import { ROLE_LABELS, TICKET_PRIORITY_LABELS, TICKET_STATUS_LABELS } from '@/config/constants';


const STATUS_COLORS: Record<TicketStatus, string> = {
    OPEN: 'bg-sky-500',
    IN_PROGRESS: 'bg-amber-500',
    RESOLVED: 'bg-emerald-500',
    CLOSED: 'bg-slate-400',
};

const PRIORITY_COLORS: Record<TicketPriority, string> = {
    CRITICAL: 'bg-red-500',
    HIGH: 'bg-orange-400',
    MEDIUM: 'bg-primary-500',
    LOW: 'bg-slate-300',
};


const AdminDashboardPage: React.FC = () => {
    const navigate = useNavigate();

    // Hooks React Query
    const { data: ticketsData, isLoading: ticketsLoading } = useTicketsQuery();
    const { data: usersData, isLoading: usersLoading } = useUsersQuery();
    const { data: categoriesData, isLoading: categoriesLoading } = useCategoriesQuery();

    const tickets = useMemo(() => {
        if (!ticketsData) return [];
        return Array.isArray(ticketsData) ? ticketsData : (ticketsData as any).results || [];
    }, [ticketsData]);

    const users = usersData || [];
    const categories = categoriesData || [];


    const stats = useMemo(() => {
        const byStatus = tickets.reduce((acc: Record<string, number>, t: any) => {
            if (t?.status) acc[t.status] = (acc[t.status] ?? 0) + 1;
            return acc;
        }, {});

        const byPriority = tickets.reduce((acc: Record<string, number>, t: any) => {
            if (t?.priority) acc[t.priority] = (acc[t.priority] ?? 0) + 1;
            return acc;
        }, {});

        const byRole = users.reduce((acc: Record<string, number>, u: any) => {
            if (u?.role) acc[u.role] = (acc[u.role] ?? 0) + 1;
            return acc;
        }, {});

        const unassigned = tickets.filter(
            (t: any) => t && !t.assignedTo && (t.status === 'OPEN' || t.status === 'IN_PROGRESS'),
        ).length;

        const resolvedToday = tickets.filter((t: any) => {
            if (!t?.resolvedAt) return false;
            const d = new Date(t.resolvedAt);
            if (isNaN(d.getTime())) return false;
            const now = new Date();
            return d.toDateString() === now.toDateString();
        }).length;

        return { byStatus, byPriority, byRole, unassigned, resolvedToday };
    }, [tickets, users]);


    const recentTickets = useMemo(
        () =>
            [...tickets]
                .filter(t => t && t.updatedAt)
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 6),
        [tickets],
    );


    const criticalOpen = useMemo(
        () =>
            tickets.filter(
                (t: TicketType) =>
                    t.priority === 'CRITICAL' &&
                    t.status !== 'RESOLVED' &&
                    t.status !== 'CLOSED',
            ),
        [tickets],
    );


    const agentLoad = useMemo(() => {
        const helpdesks = users.filter((u: any) => u.role === 'HELPDESK' || u.role === 'ADMIN');
        return helpdesks.map((agent: any) => ({
            agent,
            open: tickets.filter(
                (t: any) =>
                    t.assignedTo?.id === agent.id &&
                    (t.status === 'OPEN' || t.status === 'IN_PROGRESS'),
            ).length,
            resolved: tickets.filter(
                (t: any) =>
                    t.assignedTo?.id === agent.id &&
                    (t.status === 'RESOLVED' || t.status === 'CLOSED'),
            ).length,
        }));
    }, [tickets, users]);

    if (ticketsLoading || usersLoading || categoriesLoading) {
        return <PageLoader />;
    }

    return (
        <div className="space-y-6">


            <div className="flex items-start justify-between">
                <div>
                    <h1 className="font-heading text-xl font-bold text-slate-900">
                        Vue d'ensemble — Administration
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate('/users')}>
                        <Users className="h-3.5 w-3.5 mr-1.5" />
                        Utilisateurs
                    </Button>
                    <Button size="sm" onClick={() => navigate('/categories')}>
                        <Tag className="h-3.5 w-3.5 mr-1.5" />
                        Catégories
                    </Button>
                </div>
            </div>


            {criticalOpen.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <p className="text-sm font-semibold text-red-700">
                            {criticalOpen.length} ticket{criticalOpen.length > 1 ? 's' : ''} critique{criticalOpen.length > 1 ? 's' : ''} en attente
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {criticalOpen.map((t: any) => (
                            <button
                                key={t.id}
                                onClick={() => navigate(`/tickets/${t.id}`)}
                                className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full hover:bg-red-200 transition-colors font-medium"
                            >
                                #{t.id} · {t.subject.length > 30 ? t.subject.slice(0, 30) + '…' : t.subject}
                            </button>
                        ))}
                    </div>
                </div>
            )}


            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard
                    title="Total tickets"
                    value={tickets.length}
                    sub={`+0 aujourd'hui`}
                    icon={<Ticket className="h-5 w-5" />}
                    color="text-primary-600 bg-primary-50"
                />
                <KpiCard
                    title="Non assignés"
                    value={stats.unassigned}
                    sub="en attente d'agent"
                    icon={<Activity className="h-5 w-5" />}
                    color={stats.unassigned > 0 ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50'}
                    alert={stats.unassigned > 0}
                />
                <KpiCard
                    title="Utilisateurs"
                    value={users.length}
                    sub={`${stats.byRole['HELPDESK'] ?? 0} agents Bridge Support`}
                    icon={<Users className="h-5 w-5" />}
                    color="text-indigo-600 bg-indigo-50"
                />
                <KpiCard
                    title="Catégories"
                    value={categories.length}
                    sub="types de tickets"
                    icon={<Tag className="h-5 w-5" />}
                    color="text-cyan-600 bg-cyan-50"
                />
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Répartition par statut */}
                <Card>
                    <CardHeader>
                        <CardTitle>Par statut</CardTitle>
                        <BarChart2 className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <div className="space-y-3">
                        {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as TicketStatus[]).map((s) => {
                            const count = stats.byStatus[s] ?? 0;
                            const pct = tickets.length ? Math.round((count / tickets.length) * 100) : 0;
                            return (
                                <div key={s}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-slate-600">{TICKET_STATUS_LABELS[s]}</span>
                                        <span className="text-xs text-slate-400">{count} ({pct}%)</span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${STATUS_COLORS[s]} transition-all`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Répartition par priorité */}
                <Card>
                    <CardHeader>
                        <CardTitle>Par priorité</CardTitle>
                        <BarChart2 className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <div className="space-y-3">
                        {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as TicketPriority[]).map((p) => {
                            const count = stats.byPriority[p] ?? 0;
                            const pct = tickets.length ? Math.round((count / tickets.length) * 100) : 0;
                            return (
                                <div key={p}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-slate-600">{TICKET_PRIORITY_LABELS[p]}</span>
                                        <span className="text-xs text-slate-400">{count} ({pct}%)</span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${PRIORITY_COLORS[p]} transition-all`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Répartition des rôles */}
                <Card>
                    <CardHeader>
                        <CardTitle>Utilisateurs</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <div className="space-y-3">
                        {(['USER', 'HELPDESK', 'ADMIN'] as const).map((role) => {
                            const count = stats.byRole[role] ?? 0;
                            const pct = users.length ? Math.round((count / users.length) * 100) : 0;
                            const colors = {
                                USER: 'bg-slate-400',
                                HELPDESK: 'bg-primary-500',
                                ADMIN: 'bg-red-500',
                            };
                            return (
                                <div key={role}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-slate-600">{ROLE_LABELS[role]}</span>
                                        <span className="text-xs text-slate-400">{count} ({pct}%)</span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${colors[role]} transition-all`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        <Button
                            variant="secondary"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => navigate('/users')}
                            rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                        >
                            Gérer les utilisateurs
                        </Button>
                    </div>
                </Card>
            </div>


            <Card padding="none">
                <CardHeader className="px-5 pt-5 pb-0 mb-4">
                    <CardTitle>Charge des agents</CardTitle>
                    <Headphones className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-t border-slate-100 bg-slate-50">
                                {['Agent', 'Rôle', 'Tickets ouverts', 'Tickets résolus', 'Charge'].map((h) => (
                                    <th key={h} className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 tracking-wide">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {agentLoad.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-400">
                                        Aucun agent disponible
                                    </td>
                                </tr>
                            ) : (
                                agentLoad.map(({ agent, open, resolved }: { agent: any, open: number, resolved: number }) => {
                                    const total = open + resolved;
                                    const pct = total ? Math.round((open / total) * 100) : 0;
                                    const loadColor =
                                        open >= 5 ? 'bg-red-100 text-red-700' :
                                            open >= 3 ? 'bg-amber-100 text-amber-700' :
                                                'bg-emerald-100 text-emerald-700';
                                    return (
                                        <tr key={agent.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <Avatar firstName={agent.firstName} lastName={agent.lastName} size="sm" />
                                                    <div>
                                                        <p className="font-medium text-slate-900 text-sm">
                                                            {agent.firstName} {agent.lastName}
                                                        </p>
                                                        <p className="text-xs text-slate-400">{agent.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <Badge variant={agent.role === 'ADMIN' ? 'danger' : 'primary'}>
                                                    {ROLE_LABELS[agent.role]}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-3 font-semibold text-slate-700">{open}</td>
                                            <td className="px-5 py-3 text-slate-500">{resolved}</td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-20 rounded-full bg-slate-100 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${open >= 5 ? 'bg-red-500' : open >= 3 ? 'bg-amber-500' : 'bg-emerald-500'} transition-all`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${loadColor}`}>
                                                        {open === 0 ? 'Libre' : open >= 5 ? 'Surchargé' : open >= 3 ? 'Chargé' : 'OK'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>


            <Card padding="none">
                <CardHeader className="px-5 pt-5 pb-0 mb-3">
                    <CardTitle>Dernière activité</CardTitle>
                    <Button
                        variant="ghost" size="sm"
                        rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                        onClick={() => navigate('/tickets')}
                    >
                        Tous les tickets
                    </Button>
                </CardHeader>
                <div className="divide-y divide-slate-100">
                    {recentTickets.map((ticket: any) => (
                        <div
                            key={ticket.id}
                            className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors"
                            onClick={() => navigate(`/tickets/${ticket.id}`)}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs text-slate-400 font-mono shrink-0">#{ticket.id}</span>
                                    <p className="text-sm font-medium text-slate-900 truncate">{ticket.subject}</p>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span>{ticket.creator.firstName} {ticket.creator.lastName}</span>
                                    <span className="text-slate-200">·</span>
                                    <span>{ticket.category?.name || 'Sans catégorie'}</span>
                                    <span className="text-slate-200">·</span>
                                    <span>{timeAgo(ticket.updatedAt)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <PriorityBadge priority={ticket.priority} />
                                <StatusBadge status={ticket.status} />
                            </div>
                            {ticket.assignedTo ? (
                                <Avatar
                                    firstName={ticket.assignedTo.firstName}
                                    lastName={ticket.assignedTo.lastName}
                                    size="xs"
                                />
                            ) : (
                                <span className="text-xs text-slate-300 w-6 text-center">—</span>
                            )}
                        </div>
                    ))}
                </div>
            </Card>

        </div>
    );
};


interface KpiCardProps {
    title: string;
    value: number;
    sub: string;
    icon: React.ReactNode;
    color: string;
    alert?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, sub, icon, color, alert }) => (
    <Card className="relative overflow-hidden">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs font-medium text-slate-500">{title}</p>
                <p className="mt-1 font-heading text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </div>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
                {icon}
            </div>
        </div>
        {alert && value > 0 && (
            <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
        )}
    </Card>
);

export default AdminDashboardPage;
