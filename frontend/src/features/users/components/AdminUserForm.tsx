import React, { useState } from 'react';
import { Eye, EyeOff, Info } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { useCreateUserMutation, useUpdateUserMutation } from '@/features/users/hooks/useUsersQuery';
import { ROLE_LABELS } from '@/config/constants';
import type { User } from '@/types/auth.types';

interface Props {
    user?: User;
    onSuccess: () => void;
    onCancel: () => void;
}

export const AdminUserForm: React.FC<Props> = ({ user, onSuccess, onCancel }) => {
    const createUserMutation = useCreateUserMutation();
    const updateUserMutation = useUpdateUserMutation();

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [form, setForm] = useState({
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
        email: user?.email ?? '',
        role: user?.role ?? 'USER',
        password: '',
    });

    const isLoading = createUserMutation.isPending || updateUserMutation.isPending;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
        setErrors((p) => ({ ...p, [e.target.name]: '' }));
    };

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!form.firstName.trim()) errs.firstName = 'Prenom requis';
        if (!form.lastName.trim()) errs.lastName = 'Nom requis';
        if (!form.email.includes('@')) errs.email = 'Email invalide';
        if (!user && form.password.length < 6) errs.password = 'Au moins 6 caracteres';
        return errs;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        if (user) {
            updateUserMutation.mutate({
                id: user.id,
                data: {
                    firstName: form.firstName,
                    lastName: form.lastName,
                    email: form.email,
                    role: form.role as User['role'],
                }
            }, {
                onSuccess: () => onSuccess()
            });
        } else {
            createUserMutation.mutate({
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                role: form.role as User['role'],
                password: form.password
            }, {
                onSuccess: () => onSuccess()
            });
        }
    };

    const roleDescriptions: Record<string, string> = {
        USER: 'Peut creer des tickets et suivre leur evolution.',
        HELPDESK: 'Peut traiter, assigner et résoudre les tickets Bridge.',
        ADMIN: 'Acces complet : gestion des utilisateurs, categories et tous les tickets.',
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <Input
                    label="Prenom *"
                    name="firstName"
                    placeholder="Alice"
                    value={form.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                />
                <Input
                    label="Nom *"
                    name="lastName"
                    placeholder="Martin"
                    value={form.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                />
            </div>

            <Input
                label="Adresse email *"
                name="email"
                type="email"
                placeholder="alice@entreprise.com"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
            />

            {!user && (
                <Input
                    label="Mot de passe temporaire *"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    hint="L'utilisateur devra le changer a sa premiere connexion."
                    rightAddon={
                        <button
                            type="button"
                            className="pointer-events-auto text-slate-400 hover:text-slate-600"
                            onClick={() => setShowPassword((v) => !v)}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    }
                />
            )}

            <div className="space-y-2">
                <Select
                    label="Role *"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    options={Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }))}
                />
                {/* Role explanation */}
                <div className="flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
                    <Info className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-500 leading-relaxed">
                        {roleDescriptions[form.role]}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
                <Button type="submit" isLoading={isLoading}>
                    {user ? 'Enregistrer les modifications' : 'Creer le compte'}
                </Button>
            </div>
        </form>
    );
};
