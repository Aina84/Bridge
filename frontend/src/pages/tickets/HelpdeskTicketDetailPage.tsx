import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Clock, Calendar, User as UserIcon,
    CheckCircle2, UserCheck, AlertTriangle, Tag,
    Headphones,
} from 'lucide-react';
import {
    Button, Card, CardHeader, CardTitle, Badge, Avatar, Select, PageLoader
} from '@/components/ui';
import { StatusBadge, PriorityBadge } from '@/features/tickets/components/StatusBadge';
import { TicketMessages } from '@/features/tickets/components/TicketMessages';
import { TicketAttachments } from '@/features/tickets/components/TicketAttachments';
import { useTicketQuery, useUpdateTicketMutation, useAddMessageMutation } from '@/features/tickets/hooks/useTicketsQuery';
import { useTicketSocket } from '@/features/tickets/hooks/useTicketSocket';
import { useUsersQuery } from '@/features/users/hooks/useUsersQuery';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatDateTime } from '@/utils/date';
import type { TicketStatus, TicketPriority } from '@/types/ticket.types';
import type { User } from '@/types/auth.types';

const HelpdeskTicketDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const { data: ticket, isLoading: ticketLoading } = useTicketQuery(Number(id));
    const { data: usersData, isLoading: usersLoading } = useUsersQuery();

    const updateMutation = useUpdateTicketMutation();
    const messageMutation = useAddMessageMutation();
    useTicketSocket(Number(id));

    const [statusChanging, setStatusChanging] = useState(false);

    const users = usersData || [];
    const agents = useMemo(() => users.filter((u: User) => u.role === 'HELPDESK' || u.role === 'ADMIN'), [users]);

    if (ticketLoading || usersLoading) return <PageLoader />;

    if (!ticket) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <p className="text-slate-500">Ticket introuvable.</p>
                <Button onClick={() => navigate('/tickets')}>Retour</Button>
            </div>
        );
    }

    const isAssigned = ticket.assignedTo?.id === user?.id;

    const handleTakeTicket = () => {
        if (!user) return;
        updateMutation.mutate({
            id: ticket.id,
            data: { assignedToId: user.id, status: 'IN_PROGRESS' as TicketStatus }
        });
    };

    const handleStatusChange = async (newStatus: string) => {
        setStatusChanging(true);
        updateMutation.mutate({
            id: ticket.id,
            data: { status: newStatus as TicketStatus }
        }, {
            onSettled: () => setStatusChanging(false)
        });
    };

    const handleSendMessage = (content: string, attachments?: File[]) => {
        if (!user) return;
        messageMutation.mutate({
            ticketId: ticket.id,
            data: { content, attachments }
        });
    };

    const quickActions = [];
    if (!ticket.assignedTo) {
        quickActions.push(
            <Button
                key="take"
                leftIcon={<UserCheck className="h-4 w-4" />}
                onClick={handleTakeTicket}
            >
                Prendre en charge
            </Button>,
        );
    }
    if (isAssigned && ticket.status === 'IN_PROGRESS') {
        quickActions.push(
            <Button
                key="resolve"
                variant="secondary"
                leftIcon={<CheckCircle2 className="h-4 w-4" />}
                onClick={() => handleStatusChange('RESOLVED')}
                isLoading={statusChanging}
            >
                Marquer comme resolu
            </Button>,
        );
    }
    if (isAssigned && ticket.status === 'RESOLVED') {
        quickActions.push(
            <Button
                key="close"
                variant="ghost"
                onClick={() => handleStatusChange('CLOSED')}
            >
                Fermer le ticket
            </Button>,
        );
    }
    if (isAssigned && ticket.status === 'OPEN') {
        quickActions.push(
            <Button
                key="start"
                variant="secondary"
                leftIcon={<Clock className="h-4 w-4" />}
                onClick={() => handleStatusChange('IN_PROGRESS')}
            >
                Demarrer le traitement
            </Button>,
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-5">

            {/* Back + header */}
            <div className="flex items-start gap-3">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-8 w-8 p-0 mt-1">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{ticket.category?.name}</Badge>
                        {!ticket.assignedTo && (
                            <Badge variant="warning" dot>Non assigne</Badge>
                        )}
                        {ticket.assignedTo?.id === user?.id && (
                            <Badge variant="primary" dot>Assigne a moi</Badge>
                        )}
                    </div>
                    <h1 className="font-heading text-xl font-bold text-slate-900 leading-tight">
                        {ticket.subject}
                    </h1>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                        {quickActions.length > 0 && (
                            <div className="flex items-center gap-2 ml-auto">
                                {quickActions}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Banniere si ticket non assigne */}
            {!ticket.assignedTo && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 flex items-start gap-3 p-4">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-amber-800">Ce ticket est en attente d'un agent</p>
                        <p className="text-xs text-amber-600 mt-0.5">
                            Cliquez sur "Prendre en charge" pour vous l'assigner et commencer le traitement.
                        </p>
                    </div>
                    <Button size="sm" leftIcon={<UserCheck className="h-4 w-4" />} onClick={handleTakeTicket}>
                        Prendre en charge
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Colonne principale */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {ticket.description}
                        </p>
                        <TicketAttachments attachments={ticket.attachments ?? []} />
                    </Card>

                    {/* Conversation */}
                    <Card>
                        <TicketMessages
                            messages={ticket.messages ?? []}
                            onSend={handleSendMessage}
                            isResolved={ticket.status === 'CLOSED'}
                        />
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">

                    {/* Gestion rapide */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestion</CardTitle>
                        </CardHeader>
                        <div className="space-y-4">

                            {/* Statut */}
                            <div>
                                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Statut</p>
                                <Select
                                    options={[
                                        { label: 'Ouvert', value: 'OPEN' },
                                        { label: 'En cours', value: 'IN_PROGRESS' },
                                        { label: 'Resolu', value: 'RESOLVED' },
                                        { label: 'Ferme', value: 'CLOSED' },
                                    ]}
                                    value={ticket.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                />
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Priorite</p>
                                <Select
                                    options={[
                                        { label: 'Faible', value: 'LOW' },
                                        { label: 'Moyen', value: 'MEDIUM' },
                                        { label: 'Eleve', value: 'HIGH' },
                                        { label: 'Critique', value: 'CRITICAL' },
                                    ]}
                                    value={ticket.priority}
                                    onChange={(e) =>
                                        updateMutation.mutate({
                                            id: ticket.id,
                                            data: { priority: e.target.value as TicketPriority }
                                        })
                                    }
                                />
                            </div>

                            {/* Assignation */}
                            <div>
                                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Assigne a</p>
                                <Select
                                    options={[
                                        { label: 'Non assigne', value: '' },
                                        ...agents.map((a: any) => ({
                                            label: `${a.firstName} ${a.lastName}${a.id === user?.id ? ' (moi)' : ''}`,
                                            value: String(a.id),
                                        })),
                                    ]}
                                    value={ticket.assignedTo?.id ? String(ticket.assignedTo.id) : ''}
                                    onChange={(e) => {
                                        const assignedToId = e.target.value ? Number(e.target.value) : null;
                                        updateMutation.mutate({
                                            id: ticket.id,
                                            data: { assignedToId: assignedToId as any }
                                        });
                                    }}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Informations */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations</CardTitle>
                        </CardHeader>
                        <div className="space-y-3.5">
                            <InfoRow icon={<UserIcon className="h-4 w-4" />} label="Cree par">
                                <div className="flex items-center gap-2">
                                    <Avatar
                                        firstName={ticket.creator?.firstName}
                                        lastName={ticket.creator?.lastName}
                                        size="xs"
                                    />
                                    <div>
                                        <p className="text-sm text-slate-700 font-medium">
                                            {ticket.creator?.firstName} {ticket.creator?.lastName}
                                        </p>
                                        <p className="text-xs text-slate-400">{ticket.creator?.email}</p>
                                    </div>
                                </div>
                            </InfoRow>

                            {ticket.assignedTo && (
                                <InfoRow icon={<Headphones className="h-4 w-4" />} label="Agent assigne">
                                    <div className="flex items-center gap-2">
                                        <Avatar
                                            firstName={ticket.assignedTo.firstName}
                                            lastName={ticket.assignedTo.lastName}
                                            size="xs"
                                        />
                                        <p className="text-sm text-slate-700">
                                            {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
                                            {ticket.assignedTo.id === user?.id && (
                                                <span className="ml-1 text-xs text-primary-600">(vous)</span>
                                            )}
                                        </p>
                                    </div>
                                </InfoRow>
                            )}

                            <InfoRow icon={<Tag className="h-4 w-4" />} label="Categorie">
                                <span className="text-sm text-slate-600">{ticket.category.name}</span>
                            </InfoRow>

                            <InfoRow icon={<Calendar className="h-4 w-4" />} label="Cree le">
                                <span className="text-sm text-slate-600">{formatDateTime(ticket.createdAt)}</span>
                            </InfoRow>

                            <InfoRow icon={<Clock className="h-4 w-4" />} label="Derniere mise a jour">
                                <span className="text-sm text-slate-600">{formatDateTime(ticket.updatedAt)}</span>
                            </InfoRow>

                            {ticket.resolvedAt && (
                                <InfoRow icon={<CheckCircle2 className="h-4 w-4" />} label="Resolu le">
                                    <span className="text-sm text-emerald-600 font-medium">
                                        {formatDateTime(ticket.resolvedAt)}
                                    </span>
                                </InfoRow>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const InfoRow: React.FC<{
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}> = ({ icon, label, children }) => (
    <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            {icon}
            {label}
        </div>
        {children}
    </div>
);

export default HelpdeskTicketDetailPage;
