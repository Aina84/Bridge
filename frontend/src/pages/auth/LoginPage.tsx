import React from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';

const LoginPage: React.FC = () => (
  <div>
    <h2 className="font-heading text-xl font-bold text-slate-900 mb-1">Connexion</h2>
    <p className="text-sm text-slate-500 mb-6">Bienvenue ! Connectez-vous à votre espace.</p>
    <LoginForm />
  </div>
);

export default LoginPage;
