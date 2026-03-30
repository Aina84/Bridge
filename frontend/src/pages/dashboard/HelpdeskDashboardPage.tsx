import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Ticket, Clock, CheckCircle2, AlertCircle,
    ArrowRight, Inbox, TrendingUp, Zap,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, Button, Avatar, PageLoader } from '@/components/ui';
import { StatusBadge, PriorityBadge } from '@/features/tickets/components/StatusBadge';
import { useTicketsQuery } from '@/features/tickets/hooks/useTicketsQuery';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { timeAgo } from '@/utils/date';

const HelpdeskDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: ticketsData, isLoading } = useTicketsQuery();

    const tickets = useMemo(() => {
        if (!ticketsData) return [];
        return Array.isArray(ticketsData) ? ticketsData : (ticketsData as any).results || [];
    }, [ticketsData]);


    const myTickets = useMemo(
        () => tickets.filter((t: any) => t && t.assignedTo?.id === user?.id),
        [tickets, user],
    );


    const queue = useMemo(
        () =>
            tickets
                .filter((t: any) => t && !t.assignedTo && t.status === 'OPEN')
                .sort((a: any, b: any) => {
                    const pri: any = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
                    return (pri[b.priority] || 0) - (pri[a.priority] || 0);
                }),
        [tickets],
    );

    const myStats = useMemo(() => ({
        open: myTickets.filter((t: any) => t?.status === 'OPEN').length,
        progress: myTickets.filter((t: any) => t?.status === 'IN_PROGRESS').length,
        resolved: myTickets.filter((t: any) => t?.status === 'RESOLVED' || t?.status === 'CLOSED').length,
        critical: myTickets.filter((t: any) => t?.priority === 'CRITICAL' && t?.status !== 'RESOLVED' && t?.status !== 'CLOSED').length,
    }), [myTickets]);


    const urgent = useMemo(
        () =>
            myTickets
                .filter(
                    (t: any) =>
                        t && (t.priority === 'CRITICAL' || t.priority === 'HIGH') &&
                        t.status !== 'RESOLVED' &&
                        t.status !== 'CLOSED',
                )
                .slice(0, 3),
        [myTickets],
    );


    const recent = useMemo(
        () =>
            [...myTickets]
                .filter(t => t && t.updatedAt)
                .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 5),
        [myTickets],
    );

    if (isLoading) return <PageLoader />;

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="font-heading text-xl font-bold text-slate-900">
                    Bonjour, {user?.firstName} 👋
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                    Votre tableau de bord Bridge Support
                </p>
            </div>

            {/* Alertes urgentes */}
            {urgent.length > 0 && (
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="h-4 w-4 text-orange-600" />
                        <p className="text-sm font-semibold text-orange-700">
                            {urgent.length} ticket{urgent.length > 1 ? 's' : ''} urgent{urgent.length > 1 ? 's' : ''} à traiter en priorité
                        </p>
                    </div>
                    <div className="space-y-2">
                        {urgent.map((t: any) => (
                            <button
                                key={t.id}
                                onClick={() => navigate(`/tickets/${t.id}`)}
                                className="w-full text-left flex items-center justify-between rounded-lg bg-white border border-orange-100 px-3 py-2 hover:border-orange-300 transition-colors"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-mono text-xs text-slate-400">#{t.id}</span>
                                    <span className="text-sm font-medium text-slate-800 truncate">{t.subject}</span>
                                </div>
                                <div className="flex items-center gap-2 ml-2 shrink-0">
                                    <PriorityBadge priority={t.priority} />
                                    <StatusBadge status={t.status} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats perso */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard
                    title="Mes tickets ouverts"
                    value={myStats.open}
                    icon={<Ticket className="h-5 w-5" />}
                    color="text-sky-600 bg-sky-50"
                />
                <KpiCard
                    title="En cours"
                    value={myStats.progress}
                    icon={<Clock className="h-5 w-5" />}
                    color="text-amber-600 bg-amber-50"
                />
                <KpiCard
                    title="Résolus"
                    value={myStats.resolved}
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    color="text-emerald-600 bg-emerald-50"
                />
                <KpiCard
                    title="Critiques actifs"
                    value={myStats.critical}
                    icon={<AlertCircle className="h-5 w-5" />}
                    color={myStats.critical > 0 ? 'text-red-600 bg-red-50' : 'text-slate-400 bg-slate-50'}
                    alert={myStats.critical > 0}
                />
            </div>

            {/* Grille 2 colonnes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* File d'attente */}
                <Card padding="none">
                    <CardHeader className="px-5 pt-5 pb-0 mb-3">
                        <div className="flex items-center gap-2">
                            <CardTitle>File d'attente</CardTitle>
                            {queue.length > 0 && (
                                <span className="inline-flex h-5 items-center justify-center rounded-full bg-primary-600 px-1.5 text-xs font-medium text-white">
                                    {queue.length}
                                </span>
                            )}
                        </div>
                        <Button
                            variant="ghost" size="sm"
                            rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                            onClick={() => navigate('/tickets')}
                        >
                            Voir tout
                        </Button>
                    </CardHeader>

                    <div className="divide-y divide-slate-100">
                        {queue.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                                <Inbox className="h-8 w-8 text-slate-200" />
                                <p className="text-sm">File d'attente vide ✓</p>
                            </div>
                        ) : (
                            queue.slice(0, 5).map((ticket: any) => (
                                <div
                                    key={ticket.id}
                                    className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                                >
                                    <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${ticket.priority === 'CRITICAL' ? 'bg-red-500' :
                                        ticket.priority === 'HIGH' ? 'bg-orange-400' :
                                            ticket.priority === 'MEDIUM' ? 'bg-primary-500' :
                                                'bg-slate-300'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 truncate">{ticket.subject}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {ticket.category?.name || 'Sans catégorie'} · {timeAgo(ticket.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <PriorityBadge priority={ticket.priority} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Mes tickets récents */}
                <Card padding="none">
                    <CardHeader className="px-5 pt-5 pb-0 mb-3">
                        <CardTitle>Mes tickets récents</CardTitle>
                        <Button
                            variant="ghost" size="sm"
                            rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                            onClick={() => navigate('/tickets')}
                        >
                            Tous
                        </Button>
                    </CardHeader>

                    <div className="divide-y divide-slate-100">
                        {recent.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                                <TrendingUp className="h-8 w-8 text-slate-200" />
                                <p className="text-sm">Aucun ticket assigné</p>
                            </div>
                        ) : (
                            recent.map((ticket: any) => (
                                <div
                                    key={ticket.id}
                                    className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                                >
                                    <Avatar
                                        firstName={ticket.creator?.firstName || '?'}
                                        lastName={ticket.creator?.lastName || '?'}
                                        size="xs"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 truncate">{ticket.subject}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {ticket.creator?.firstName || 'Utilisateur'} · {timeAgo(ticket.updatedAt)}
                                        </p>
                                    </div>
                                    <StatusBadge status={ticket.status} />
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};


interface KpiCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    alert?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, color, alert }) => (
    <Card className="relative overflow-hidden">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs font-medium text-slate-500 leading-tight">{title}</p>
                <p className="mt-1 font-heading text-2xl font-bold text-slate-900">{value}</p>
            </div>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
                {icon}
            </div>
        </div>
        {alert && value > 0 && (
            <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
        )}
    </Card>
);

export default HelpdeskDashboardPage;
