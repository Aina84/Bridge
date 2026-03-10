import React, { useState, useMemo } from 'react';
import {
    Tag, Plus, Trash2, AlertCircle,
} from 'lucide-react';
import {
    Button, Card, Input, Modal, Badge, PageLoader
} from '@/components/ui';
import { useCategoriesQuery, useCreateCategoryMutation, useDeleteCategoryMutation } from '@/features/categories/hooks/useCategoriesQuery';
import { useTicketsQuery } from '@/features/tickets/hooks/useTicketsQuery';

const AdminCategoriesPage: React.FC = () => {
    const { data: categoriesData, isLoading: categoriesLoading } = useCategoriesQuery();
    const { data: ticketsData, isLoading: ticketsLoading } = useTicketsQuery();
    const createMutation = useCreateCategoryMutation();
    const deleteMutation = useDeleteCategoryMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCat, setNewCat] = useState({ name: '', description: '' });
    const [error, setError] = useState('');

    const categories = categoriesData || [];
    const tickets = useMemo(() => {
        if (!ticketsData) return [];
        return Array.isArray(ticketsData) ? ticketsData : (ticketsData as any).results || [];
    }, [ticketsData]);


    const catStats = useMemo(() => {
        const map: Record<number, number> = {};
        for (const t of tickets) {
            const cid = t.category?.id;
            if (cid !== undefined) {
                map[cid] = (map[cid] ?? 0) + 1;
            }
        }
        return map;
    }, [tickets]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCat.name.trim()) {
            setError('Le nom est requis');
            return;
        }
        createMutation.mutate(newCat, {
            onSuccess: () => {
                setIsModalOpen(false);
                setNewCat({ name: '', description: '' });
                setError('');
            },
            onError: (err: any) => {
                setError(err.response?.data?.message || 'Une erreur est survenue');
            }
        });
    };

    const handleDelete = (id: number, name: string) => {
        const count = catStats[id] ?? 0;
        const msg = count > 0
            ? `Attention: Cette categorie contient ${count} ticket(s). Supprimer quand meme "${name}" ?`
            : `Supprimer la categorie "${name}" ?`;

        if (confirm(msg)) {
            deleteMutation.mutate(id);
        }
    };

    if (categoriesLoading || ticketsLoading) return <PageLoader />;

    return (
        <div className="space-y-6">


            <div className="flex items-start justify-between">
                <div>
                    <h1 className="font-heading text-xl font-bold text-slate-900">Categories de tickets</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Gerez les types de demandes pour organiser le support
                    </p>
                </div>
                <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
                    Nouvelle categorie
                </Button>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 gap-3 border-2 border-dashed border-slate-100 rounded-2xl">
                        <Tag className="h-10 w-10 text-slate-200" />
                        <p className="text-sm">Aucune categorie definie</p>
                    </div>
                ) : (
                    categories.map((cat: any) => {
                        const count = catStats[cat.id] ?? 0;
                        return (
                            <Card key={cat.id} className="group hover:border-primary-200 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                                        <Tag className="h-5 w-5" />
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost" size="sm"
                                            className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(cat.id, cat.name)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-slate-900 group-hover:text-primary-700 transition-colors">
                                    {cat.name}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[2rem]">
                                    {cat.description || 'Aucune description'}
                                </p>
                                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-400">Tickets associes</span>
                                    <Badge variant={count > 0 ? 'primary' : 'outline'} className="text-[10px] px-1.5 py-0">
                                        {count}
                                    </Badge>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>


            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setError(''); }}
                title="Ajouter une categorie"
                size="sm"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 border border-red-100">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {error}
                        </div>
                    )}

                    <Input
                        label="Nom de la categorie *"
                        placeholder="Ex: Facturation, Support Technique..."
                        value={newCat.name}
                        onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                        autoFocus
                    />

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                            Description (optionnel)
                        </label>
                        <textarea
                            className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all resize-none"
                            placeholder="A quoi sert cette categorie ?"
                            value={newCat.description}
                            onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                            Annuler
                        </Button>
                        <Button type="submit" isLoading={createMutation.isPending}>
                            Creer la categorie
                        </Button>
                    </div>
                </form>
            </Modal>

        </div>
    );
};

export default AdminCategoriesPage;
