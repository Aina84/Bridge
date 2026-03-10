// src/layouts/AuthLayout.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { APP_NAME, ROUTES } from '@/config/constants';

export const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 shadow-lg mb-3">
            <Ticket className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">{APP_NAME}</h1>
          <p className="text-sm text-slate-500 mt-1">Système de gestion des tickets</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
