import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '@/config/constants';

import { authApi } from '../api/auth.api';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data } = await authApi.login(form);
      setAuth(data.user, data.tokens.accessToken);
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Email ou mot de passe incorrect.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Adresse email"
        name="email"
        type="email"
        placeholder="vous@exemple.com"
        autoComplete="email"
        value={form.email}
        onChange={handleChange}
        required
        leftAddon={<Mail className="h-4 w-4" />}
      />
      <Input
        label="Mot de passe"
        name="password"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        autoComplete="current-password"
        value={form.password}
        onChange={handleChange}
        required
        leftAddon={<Lock className="h-4 w-4" />}
        rightAddon={
          <button
            type="button"
            className="pointer-events-auto text-slate-400 hover:text-slate-600 transition-colors"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
      />

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-100">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" isLoading={isLoading} size="lg">
        Se connecter
      </Button>

      <p className="text-center text-sm text-slate-500">
        Pas encore de compte ?{' '}
        <Link
          to={ROUTES.AUTH.REGISTER}
          className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          S'inscrire
        </Link>
      </p>

      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 space-y-0.5">
        <p className="font-medium text-slate-600 mb-1">Exemples de Comptes :</p>
        <p> _ADMINISTRATEUR</p>
        <p>🛡️ admin@gmail.com / 123456</p>
        <p> _SUPPORT</p>
        <p>🎧 tovo@gmail.com / 123456</p>
        <p> _CLIENT</p>
        <p>👤 user2@gmail.com / 123456</p>
      </div>
    </form>
  );
};
