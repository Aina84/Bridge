import React, { useState, useMemo } from 'react';
import {
    UserPlus, Search, Shield, Headphones, User as UserIcon,
    Trash2, Edit, MoreVertical, Filter, UserCheck,
} from 'lucide-react';
import {
    Avatar, Badge, Button, Input, Select, Modal, Card, PageLoader
} from '@/components/ui';
import { formatDate } from '@/utils/date';
import { ROLE_LABELS } from '@/config/constants';
import { useUsersQuery, useDeleteUserMutation } from '@/features/users/hooks/useUsersQuery';
import { useTicketsQuery } from '@/features/tickets/hooks/useTicketsQuery';
import { AdminUserForm } from '@/features/users/components/AdminUserForm';
import type { User } from '@/types/auth.types';

type RoleFilter = 'ALL' | 'USER' | 'HELPDESK' | 'ADMIN';

const ROLE_BADGE: Record<string, { variant: 'default' | 'primary' | 'danger'; icon: React.ReactNode }> = {
    USER: { variant: 'default', icon: <UserIcon className="h-3 w-3" /> },
    HELPDESK: { variant: 'primary', icon: <Headphones className="h-3 w-3" /> },
    ADMIN: { variant: 'danger', icon: <Shield className="h-3 w-3" /> },
};

const AdminUsersPage: React.FC = () => {
    const { data: usersData, isLoading: usersLoading } = useUsersQuery();
    const { data: ticketsData, isLoading: ticketsLoading } = useTicketsQuery();
    const deleteMutation = useDeleteUserMutation();

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editUser, setEditUser] = useState<User | undefined>();

    const users = usersData || [];
    const tickets = useMemo(() => {
        if (!ticketsData) return [];
        return Array.isArray(ticketsData) ? ticketsData : (ticketsData as any).results || [];
    }, [ticketsData]);


    const userStats = useMemo(() => {
        const map: Record<number, { open: number; total: number }> = {};
        for (const t of tickets) {
            const cid = t.creator.id;
            if (!map[cid]) map[cid] = { open: 0, total: 0 };
            map[cid].total++;
            if (t.status === 'OPEN' || t.status === 'IN_PROGRESS') map[cid].open++;

            if (t.assignedTo) {
                const aid = t.assignedTo.id;
                if (!map[aid]) map[aid] = { open: 0, total: 0 };
                // Note: we don't have mission stats here, but we could add them
            }
        }
        return map;
    }, [tickets]);

    const filtered = useMemo(() => {
        return users.filter((u: any) => {
            const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
            const matchSearch = `${u.firstName} ${u.lastName} ${u.email}`
                .toLowerCase()
                .includes(search.toLowerCase());
            return matchRole && matchSearch;
        });
    }, [users, search, roleFilter]);

    const handleEdit = (user: User) => {
        setEditUser(user);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditUser(undefined);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Supprimer definitivement cet utilisateur ?')) {
            deleteMutation.mutate(id);
        }
    };


    const roleCounts = useMemo(
        () => ({
            USER: users.filter((u: any) => u.role === 'USER').length,
            HELPDESK: users.filter((u: any) => u.role === 'HELPDESK').length,
            ADMIN: users.filter((u: any) => u.role === 'ADMIN').length,
        }),
        [users],
    );

    if (usersLoading || ticketsLoading) return <PageLoader />;

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="font-heading text-xl font-bold text-slate-900">Utilisateurs</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {users.length} compte{users.length > 1 ? 's' : ''} au total
                    </p>
                </div>
                <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={handleAdd}>
                    Ajouter un utilisateur
                </Button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
                {(['USER', 'HELPDESK', 'ADMIN'] as const).map((role) => (
                    <button
                        key={role}
                        onClick={() => setRoleFilter(roleFilter === role ? 'ALL' : role)}
                        className={`rounded-xl border p-4 text-left transition-all ${roleFilter === role
                            ? 'border-primary-300 bg-primary-50 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            {ROLE_BADGE[role].icon}
                            <span className="text-xs font-medium text-slate-500">{ROLE_LABELS[role]}</span>
                        </div>
                        <p className="font-heading text-2xl font-bold text-slate-900">{roleCounts[role]}</p>
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <Input
                    placeholder="Rechercher par nom ou email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    leftAddon={<Search className="h-4 w-4" />}
                    className="max-w-xs"
                />
                <div className="flex items-center gap-1.5">
                    <Filter className="h-4 w-4 text-slate-400" />
                    {(['ALL', 'USER', 'HELPDESK', 'ADMIN'] as RoleFilter[]).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRoleFilter(r)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${roleFilter === r
                                ? 'bg-primary-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {r === 'ALL' ? 'Tous' : ROLE_LABELS[r]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <Card padding="none">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                {['Utilisateur', 'Role', 'Tickets', 'Inscrit le', ''].map((h) => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 tracking-wide">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">
                                        Aucun utilisateur trouve
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((user: any) => {
                                    const st = userStats[user.id] ?? { open: 0, total: 0 };
                                    const rb = ROLE_BADGE[user.role] || ROLE_BADGE.USER;
                                    return (
                                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                            {/* User */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <Avatar firstName={user.firstName} lastName={user.lastName} size="sm" />
                                                    <div>
                                                        <p className="font-semibold text-slate-900">
                                                            {user.firstName} {user.lastName}
                                                        </p>
                                                        <p className="text-xs text-slate-400">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Role */}
                                            <td className="px-5 py-3.5">
                                                <Badge variant={rb.variant}>
                                                    <span className="flex items-center gap-1">
                                                        {rb.icon}
                                                        {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
                                                    </span>
                                                </Badge>
                                            </td>
                                            {/* Tickets */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-slate-700 font-medium">{st.total}</span>
                                                    {st.open > 0 && (
                                                        <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                                                            {st.open} ouvert{st.open > 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            {/* Date */}
                                            <td className="px-5 py-3.5 text-slate-500 text-xs">
                                                {formatDate(user.createdAt)}
                                            </td>
                                            {/* Actions */}
                                            <td className="px-5 py-3.5 relative">
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost" size="sm"
                                                        className="h-7 w-7 p-0"
                                                        onClick={() => handleEdit(user)}
                                                        title="Modifier"
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost" size="sm"
                                                        className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleDelete(user.id)}
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
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

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                size="md"
            >
                <AdminUserForm
                    user={editUser}
                    onSuccess={() => setIsModalOpen(false)}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default AdminUsersPage;
