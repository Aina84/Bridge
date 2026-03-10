// src/pages/tickets/CreateTicketPage.tsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { TicketForm } from '@/features/tickets/components/TicketForm';

const CreateTicketPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-8 w-8 p-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-heading text-xl font-bold text-slate-900">Nouveau ticket</h1>
          <p className="text-sm text-slate-500">Décrivez votre problème ci-dessous.</p>
        </div>
      </div>

      <Card>
        <TicketForm />
      </Card>
    </div>
  );
};

export default CreateTicketPage;
