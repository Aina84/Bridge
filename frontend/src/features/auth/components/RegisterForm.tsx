// src/features/auth/components/RegisterForm.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User as UserIcon } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '@/config/constants';
import { authApi } from '../api/auth.api';

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 1
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'Prénom requis';
    if (!form.lastName.trim()) errs.lastName = 'Nom requis';
    if (!form.email.includes('@')) errs.email = 'Email invalide';
    if (form.password.length < 6) errs.password = 'Au moins 6 caractères';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Les mots de passe ne correspondent pas';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setIsLoading(true);

    try {
      const { data } = await authApi.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: 1,
      });
      setAuth(data.user, data.tokens.accessToken);
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      console.error('Registration error:', err);
      const backendErrors = err.response?.data;
      if (backendErrors && typeof backendErrors === 'object') {
        setErrors(backendErrors);
      } else {
        setErrors({ general: 'Une erreur est survenue lors de l\'inscription.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Prénom"
          name="firstName"
          placeholder="Alice"
          value={form.firstName}
          onChange={handleChange}
          error={errors.firstName}
          leftAddon={<UserIcon className="h-4 w-4" />}
          required
        />
        <Input
          label="Nom"
          name="lastName"
          placeholder="Martin"
          value={form.lastName}
          onChange={handleChange}
          error={errors.lastName}
          required
        />
      </div>
      <Input
        label="Adresse email"
        name="email"
        type="email"
        placeholder="vous@exemple.com"
        value={form.email}
        onChange={handleChange}
        error={errors.email}
        leftAddon={<Mail className="h-4 w-4" />}
        required
      />
      <Input
        label="Mot de passe"
        name="password"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        value={form.password}
        onChange={handleChange}
        error={errors.password}
        leftAddon={<Lock className="h-4 w-4" />}
        rightAddon={
          <button
            type="button"
            className="pointer-events-auto text-slate-400 hover:text-slate-600"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        required
      />
      <Input
        label="Confirmer le mot de passe"
        name="confirmPassword"
        type="password"
        placeholder="••••••••"
        value={form.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        leftAddon={<Lock className="h-4 w-4" />}
        required
      />

      {errors.general && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-100">
          {errors.general}
        </p>
      )}

      <Button type="submit" className="w-full" isLoading={isLoading} size="lg">
        Créer mon compte
      </Button>

      <p className="text-center text-sm text-slate-500">
        Déjà un compte ?{' '}
        <Link
          to={ROUTES.AUTH.LOGIN}
          className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          Se connecter
        </Link>
      </p>
    </form>
  );
};
