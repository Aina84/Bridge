import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, Button, Avatar, PageLoader } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useTicketsQuery } from '@/features/tickets/hooks/useTicketsQuery';
import { StatusBadge, PriorityBadge } from '@/features/tickets/components/StatusBadge';
import { timeAgo } from '@/utils/date';

const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: ticketsData, isLoading } = useTicketsQuery();

  const tickets = React.useMemo(() => {
    if (!ticketsData) return [];
    return Array.isArray(ticketsData) ? ticketsData : (ticketsData as any).results || [];
  }, [ticketsData]);

  const myTickets = React.useMemo(() => {
    if (!user) return [];
    return user.role === 'USER'
      ? tickets.filter((t: any) => t && t.creator?.id === user.id)
      : tickets;
  }, [tickets, user]);

  const stats = React.useMemo(() => {
    return {
      open: myTickets.filter((t: any) => t?.status === 'OPEN').length,
      inProgress: myTickets.filter((t: any) => t?.status === 'IN_PROGRESS').length,
      resolved: myTickets.filter((t: any) => t?.status === 'RESOLVED' || t?.status === 'CLOSED').length,
      critical: myTickets.filter((t: any) => t?.priority === 'CRITICAL').length,
    };
  }, [myTickets]);

  const recent = React.useMemo(() => {
    return [...myTickets]
      .filter(t => t && t.updatedAt)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [myTickets]);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-slate-900">
            Bonjour, {user?.firstName} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Voici un aperçu de votre activité.
          </p>
        </div>
        {user?.role === 'USER' && (
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => navigate('/tickets/new')}
          >
            Nouveau ticket
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Ouverts"
          value={stats.open}
          icon={<Ticket className="h-5 w-5" />}
          color="text-sky-600 bg-sky-50"
        />
        <StatCard
          title="En cours"
          value={stats.inProgress}
          icon={<Clock className="h-5 w-5" />}
          color="text-amber-600 bg-amber-50"
        />
        <StatCard
          title="Résolus"
          value={stats.resolved}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="text-emerald-600 bg-emerald-50"
        />
        <StatCard
          title="Critiques"
          value={stats.critical}
          icon={<AlertCircle className="h-5 w-5" />}
          color="text-red-600 bg-red-50"
          alert={stats.critical > 0}
        />
      </div>

      {/* Recent Tickets */}
      <Card padding="none">
        <CardHeader className="px-5 pt-5 pb-0">
          <CardTitle>Activité récente</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            onClick={() => navigate('/tickets')}
          >
            Voir tout
          </Button>
        </CardHeader>

        <div className="divide-y divide-slate-100 mt-3">
          {recent.length === 0 ? (
            <div className="py-12 text-center">
              <TrendingUp className="h-8 w-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Aucun ticket pour l'instant</p>
            </div>
          ) : (
            recent.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs text-slate-400 font-mono">#{ticket.id}</span>
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {ticket.subject}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{timeAgo(ticket.updatedAt)}</span>
                    <span className="text-slate-200">·</span>
                    <span className="text-xs text-slate-500">{ticket.category?.name || 'Sans catégorie'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                </div>
                {ticket.assignedTo && (
                  <Avatar
                    firstName={ticket.assignedTo.firstName}
                    lastName={ticket.assignedTo.lastName}
                    size="xs"
                  />
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  alert?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, alert }) => (
  <Card className="relative overflow-hidden">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500">{title}</p>
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

export default UserDashboardPage;
