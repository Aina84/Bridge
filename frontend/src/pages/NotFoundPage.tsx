// src/pages/NotFoundPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
      <p className="font-heading text-4xl font-bold text-slate-200">404</p>
      <p className="font-heading text-lg font-semibold text-slate-700">Page introuvable</p>
      <p className="text-sm text-slate-400">La page que vous cherchez n'existe pas.</p>
      <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
    </div>
  );
};

export default NotFoundPage;
