import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Textarea, Select } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCategoriesQuery } from '@/features/categories/hooks/useCategoriesQuery';
import { useCreateTicketMutation } from '@/features/tickets/hooks/useTicketsQuery';
import type { TicketPriority } from '@/types/ticket.types';

export const TicketForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: categories = [] } = useCategoriesQuery();
  const createTicket = useCreateTicketMutation();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<File[]>([]);
  const [form, setForm] = useState({
    subject: '',
    description: '',
    priority: 'MEDIUM' as TicketPriority,
    categoryId: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.subject.trim()) errs.subject = 'Sujet requis';
    if (!form.description.trim()) errs.description = 'Description requise';
    if (!form.categoryId) errs.categoryId = 'Catégorie requise';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!user) return;

    createTicket.mutate(
      {
        subject: form.subject,
        description: form.description,
        priority: form.priority,
        categoryId: Number(form.categoryId),
        attachments,
      },
      {
        onSuccess: (response) => {
          navigate(`/tickets/${response.data.id}`);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Sujet *"
        name="subject"
        placeholder="Résumez votre problème en une ligne"
        value={form.subject}
        onChange={handleChange}
        error={errors.subject}
      />

      <Textarea
        label="Description *"
        name="description"
        placeholder="Décrivez votre problème en détail : contexte, étapes pour reproduire, comportement attendu…"
        value={form.description}
        onChange={handleChange}
        error={errors.description}
        rows={6}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Catégorie *"
          name="categoryId"
          placeholder="Sélectionner…"
          value={form.categoryId}
          onChange={handleChange}
          error={errors.categoryId}
          options={categories.map((c: any) => ({ label: c.name, value: c.id }))}
        />
        <Select
          label="Priorité"
          name="priority"
          value={form.priority}
          onChange={handleChange}
          options={[
            { label: 'Faible', value: 'LOW' },
            { label: 'Moyen', value: 'MEDIUM' },
            { label: 'Élevé', value: 'HIGH' },
            { label: 'Critique', value: 'CRITICAL' },
          ]}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Pièces jointes</label>
        <div className="flex items-center gap-3">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-50 file:text-primary-700
              hover:file:bg-primary-100"
          />
          {attachments.length > 0 && (
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {attachments.length} fichier{attachments.length > 1 ? 's' : ''} sélectionné{attachments.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Annuler
        </Button>
        <Button type="submit" isLoading={createTicket.isPending}>
          Créer le ticket
        </Button>
      </div>
    </form>
  );
};
