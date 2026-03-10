import React, { useState } from 'react';
import { Tag, Trash2, Plus } from 'lucide-react';
import { Button, Modal, Input, EmptyState } from '@/components/ui';
import { useCategoriesQuery, useCreateCategoryMutation, useDeleteCategoryMutation } from '@/features/categories/hooks/useCategoriesQuery';
import { formatDate } from '@/utils/date';

export const CategoryList: React.FC = () => {
  const { data: categories = [], isLoading: isFetching } = useCategoriesQuery();
  const createCategory = useCreateCategoryMutation();
  const deleteCategory = useDeleteCategoryMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    createCategory.mutate(form, {
      onSuccess: () => {
        setForm({ name: '', description: '' });
        setIsModalOpen(false);
      }
    });
  };

  if (isFetching) {
    return <div className="text-slate-500">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
          Nouvelle catégorie
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={<Tag className="h-6 w-6" />}
          title="Aucune catégorie"
          description="Créez des catégories pour organiser vos tickets."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat: any) => (
            <div
              key={cat.id}
              className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
                  <Tag className="h-4 w-4 text-primary-600" />
                </span>
                <div>
                  <p className="font-semibold text-sm text-slate-900">{cat.name}</p>
                  {cat.description && (
                    <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">Créé le {formatDate(cat.createdAt)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                onClick={() => deleteCategory.mutate(cat.id)}
                isLoading={deleteCategory.isPending && deleteCategory.variables === cat.id}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouvelle catégorie"
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom *"
            name="name"
            placeholder="ex. Technique"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
          />
          <Input
            label="Description"
            name="description"
            placeholder="Brève description…"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit" isLoading={createCategory.isPending}>Créer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
