import React, { useState } from 'react';
import { Button, Input, Select } from '@/components/ui';
import { useCreateUserMutation, useUpdateUserMutation } from '../hooks/useUsersQuery';
import type { User } from '@/types/auth.types';
import type { CreateUserDto, UpdateUserDto } from '@/types/user.types';

interface Props {
  user?: User;
  onSuccess: () => void;
  onCancel: () => void;
}

export const UserForm: React.FC<Props> = ({ user, onSuccess, onCancel }) => {
  const createUser = useCreateUserMutation();
  const updateUser = useUpdateUserMutation();

  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    role: user?.role ?? 'USER',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (user) {
      const data: UpdateUserDto = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: form.role as User['role'],
      };
      if (form.password) data.password = form.password;

      updateUser.mutate(
        { id: user.id, data },
        { onSuccess: () => onSuccess() }
      );
    } else {
      const data: CreateUserDto = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: form.role as User['role'],
      };

      createUser.mutate(
        data,
        { onSuccess: () => onSuccess() }
      );
    }
  };

  const isPending = createUser.isPending || updateUser.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Prénom" name="firstName" value={form.firstName} onChange={handleChange} required />
        <Input label="Nom" name="lastName" value={form.lastName} onChange={handleChange} required />
      </div>
      <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
      {!user && (
        <Input label="Mot de passe" name="password" type="password" value={form.password} onChange={handleChange} required />
      )}
      <Select
        label="Rôle"
        name="role"
        value={form.role}
        onChange={handleChange}
        options={[
          { label: 'Utilisateur', value: 'USER' },
          { label: 'Support Bridge', value: 'HELPDESK' },
          { label: 'Administrateur', value: 'ADMIN' },
        ]}
      />
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit" isLoading={isPending}>
          {user ? 'Enregistrer' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};
