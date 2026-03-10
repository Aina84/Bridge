import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Calendar,
  User as UserIcon,
  Headphones,
  ChevronDown,
} from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  Badge,
  Avatar,
  Select,
} from '@/components/ui';
import { StatusBadge, PriorityBadge } from '@/features/tickets/components/StatusBadge';
import { TicketMessages } from '@/features/tickets/components/TicketMessages';
import { TicketAttachments } from '@/features/tickets/components/TicketAttachments';
import {
  useTicketQuery,
  useUpdateTicketMutation,
  useAddMessageMutation,
} from '@/features/tickets/hooks/useTicketsQuery';
import { useTicketSocket } from '@/features/tickets/hooks/useTicketSocket';
import { useHelpdeskUsersQuery } from '@/features/users/hooks/useUsersQuery';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatDateTime } from '@/utils/date';
import type { TicketStatus, TicketPriority } from '@/types/ticket.types';

const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const ticketId = Number(id);
  const { data: ticket, isLoading: isLoadingTicket } = useTicketQuery(ticketId);
  const updateTicket = useUpdateTicketMutation();
  const addMessage = useAddMessageMutation();
  useTicketSocket(ticketId);

  const { data: helpdeskUsers = [] } = useHelpdeskUsersQuery();
  const [editingStatus, setEditingStatus] = useState(false);

  if (isLoadingTicket) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-slate-500 animate-pulse">Chargement...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-slate-500">Ticket introuvable.</p>
        <Button onClick={() => navigate('/tickets')}>Retour aux tickets</Button>
      </div>
    );
  }

  const isStaff = user?.role === 'HELPDESK' || user?.role === 'ADMIN';
  const isClosed = ticket.status === 'CLOSED';

  const handleStatusChange = (status: string) => {
    updateTicket.mutate({ id: ticket.id, data: { status: status as TicketStatus } });
    setEditingStatus(false);
  };

  const handleAssign = (userId: string) => {
    updateTicket.mutate({ id: ticket.id, data: { assignedToId: Number(userId) || null } } as any);
  };

  const handleSendMessage = (content: string, attachments?: File[]) => {
    if (!user) return;
    addMessage.mutate({ ticketId: ticket.id, data: { content, attachments } });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Back + header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-8 w-8 p-0 mt-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-slate-400">#{ticket.id}</span>
            <Badge variant="outline" className="text-xs">{ticket.category?.name}</Badge>
          </div>
          <h1 className="font-heading text-xl font-bold text-slate-900 leading-tight">
            {ticket.subject}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <p className="text-sm text-slate-600 leading-relaxed">{ticket.description}</p>
            <TicketAttachments attachments={ticket.attachments ?? []} />
          </Card>

          {/* Messages */}
          <Card>
            <TicketMessages
              messages={ticket.messages ?? []}
              onSend={handleSendMessage}
              isResolved={isClosed}
            />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status management (staff only) */}
          {isStaff && (
            <Card>
              <CardHeader>
                <CardTitle>Gestion</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1.5">Statut</p>
                  {editingStatus ? (
                    <Select
                      options={[
                        { label: 'Ouvert', value: 'OPEN' },
                        { label: 'En cours', value: 'IN_PROGRESS' },
                        { label: 'Résolu', value: 'RESOLVED' },
                        { label: 'Fermé', value: 'CLOSED' },
                      ]}
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                    />
                  ) : (
                    <button
                      className="flex items-center gap-2 w-full text-left"
                      onClick={() => setEditingStatus(true)}
                    >
                      <StatusBadge status={ticket.status} />
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                  )}
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1.5">Priorité</p>
                  <Select
                    options={[
                      { label: 'Faible', value: 'LOW' },
                      { label: 'Moyen', value: 'MEDIUM' },
                      { label: 'Élevé', value: 'HIGH' },
                      { label: 'Critique', value: 'CRITICAL' },
                    ]}
                    value={ticket.priority}
                    onChange={(e) => updateTicket.mutate({ id: ticket.id, data: { priority: e.target.value as TicketPriority } })}
                  />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1.5">Assigné à</p>
                  <Select
                    options={[
                      { label: 'Non assigné', value: '' },
                      ...helpdeskUsers.map((u: any) => ({
                        label: `${u.firstName} ${u.lastName}`,
                        value: u.id,
                      })),
                    ]}
                    value={ticket.assignedTo?.id ?? ''}
                    onChange={(e) => handleAssign(e.target.value)}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Ticket info */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <InfoRow
                icon={<UserIcon className="h-4 w-4" />}
                label="Créé par"
              >
                <div className="flex items-center gap-2">
                  <Avatar
                    firstName={ticket.creator?.firstName}
                    lastName={ticket.creator?.lastName}
                    size="xs"
                  />
                  <span className="text-sm text-slate-700">
                    {ticket.creator?.firstName} {ticket.creator?.lastName}
                  </span>
                </div>
              </InfoRow>

              {ticket.assignedTo && (
                <InfoRow
                  icon={<Headphones className="h-4 w-4" />}
                  label="Assigné à"
                >
                  <div className="flex items-center gap-2">
                    <Avatar
                      firstName={ticket.assignedTo.firstName}
                      lastName={ticket.assignedTo.lastName}
                      size="xs"
                    />
                    <span className="text-sm text-slate-700">
                      {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
                    </span>
                  </div>
                </InfoRow>
              )}

              <InfoRow icon={<Calendar className="h-4 w-4" />} label="Créé le">
                <span className="text-sm text-slate-600">{formatDateTime(ticket.createdAt)}</span>
              </InfoRow>

              <InfoRow icon={<Clock className="h-4 w-4" />} label="Mis à jour">
                <span className="text-sm text-slate-600">{formatDateTime(ticket.updatedAt)}</span>
              </InfoRow>

              {ticket.resolvedAt && (
                <InfoRow icon={<Clock className="h-4 w-4" />} label="Résolu le">
                  <span className="text-sm text-emerald-600">{formatDateTime(ticket.resolvedAt)}</span>
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
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
      {icon}
      {label}
    </div>
    {children}
  </div>
);

export default TicketDetailPage;
