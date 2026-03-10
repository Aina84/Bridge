// src/features/users/components/UserList.tsx
import React, { useState } from 'react';
import { Trash2, Edit, UserPlus, Shield, Headphones, User as UserIcon, Search } from 'lucide-react';
import { Avatar, Badge, Button, Input, Modal } from '@/components/ui';
import { formatDate } from '@/utils/date';
import { ROLE_LABELS } from '@/config/constants';
import { useUsersQuery, useDeleteUserMutation } from '../hooks/useUsersQuery';
import { UserForm } from './UserForm';
import type { User } from '@/types/auth.types';

const roleIcon: Record<string, React.ReactNode> = {
  USER: <UserIcon className="h-3.5 w-3.5" />,
  HELPDESK: <Headphones className="h-3.5 w-3.5" />,
  ADMIN: <Shield className="h-3.5 w-3.5" />,
};

const roleBadgeVariant: Record<string, 'default' | 'primary' | 'danger'> = {
  USER: 'default',
  HELPDESK: 'primary',
  ADMIN: 'danger',
};

export const UserList: React.FC = () => {
  const { data: users = [] } = useUsersQuery();
  const deleteUser = useDeleteUserMutation();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | undefined>();

  const filtered = users.filter(
    (u) =>
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEdit = (user: User) => {
    setEditUser(user);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditUser(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Supprimer cet utilisateur ?')) {
      deleteUser.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="Rechercher un utilisateur…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftAddon={<Search className="h-4 w-4" />}
          className="max-w-xs"
        />
        <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={handleAdd}>
          Ajouter
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Utilisateur', 'Email', 'Rôle', 'Créé le', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar firstName={user.firstName} lastName={user.lastName} size="sm" />
                    <span className="font-medium text-slate-900">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{user.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={roleBadgeVariant[user.role]}>
                    <span className="flex items-center gap-1">
                      {roleIcon[user.role]}
                      {ROLE_LABELS[user.role]}
                    </span>
                  </Badge>
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">
            Aucun utilisateur trouvé
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editUser ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}
        size="md"
      >
        <UserForm
          user={editUser}
          onSuccess={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
