import React from 'react';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

const RegisterPage: React.FC = () => (
  <div>
    <h2 className="font-heading text-xl font-bold text-slate-900 mb-1">Créer un compte</h2>
    <p className="text-sm text-slate-500 mb-6">Remplissez le formulaire pour commencer.</p>
    <RegisterForm />
  </div>
);

export default RegisterPage;
