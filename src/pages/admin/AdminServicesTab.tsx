import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { serviceSchema, ServiceFormData } from '../../schemas';
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from '../../hooks/useData';
import { Service } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { useToast } from '../../components/ui/toast';
import { slugify } from '../../lib/utils';
import { Plus, Edit2, Trash2, Film, Sparkles, Smartphone, Building2, Video, Scissors, Layers } from 'lucide-react';

const AVAILABLE_ICONS = [
  { label: 'Film / Cinéma', value: 'Film' },
  { label: 'Motion / Étoile', value: 'Sparkles' },
  { label: 'Smartphone / Social', value: 'Smartphone' },
  { label: 'Entreprise / Corporate', value: 'Building2' },
  { label: 'Caméra / Vidéo', value: 'Video' },
  { label: 'Ciseaux / Découpe', value: 'Scissors' },
  { label: 'Calques / Compositing', value: 'Layers' },
];

export function AdminServicesTab() {
  const { data: services = [] } = useServices(false);
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();
  const deleteServiceMutation = useDeleteService();
  const { toast } = useToast();

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      indicative_price: '',
      indicative_duration: '',
      icon: 'Film',
      active: true,
      display_order: 0,
    },
  });

  const openCreateDialog = () => {
    setEditingService(null);
    reset({
      title: '',
      slug: '',
      description: '',
      indicative_price: 'À partir de 75 000 XOF',
      indicative_duration: '3 à 5 jours ouvrés',
      icon: 'Film',
      active: true,
      display_order: services.length + 1,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (s: Service) => {
    setEditingService(s);
    reset({
      title: s.title,
      slug: s.slug,
      description: s.description,
      indicative_price: s.indicative_price || '',
      indicative_duration: s.indicative_duration || '',
      icon: s.icon || 'Film',
      active: s.active,
      display_order: s.display_order,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: ServiceFormData) => {
    try {
      const slug = data.slug || slugify(data.title);
      if (editingService) {
        await updateServiceMutation.mutateAsync({
          id: editingService.id,
          updates: {
            ...data,
            slug,
          },
        });
        toast({
          title: 'Service modifié',
          message: `La prestation "${data.title}" a été mise à jour.`,
          type: 'success',
        });
      } else {
        await createServiceMutation.mutateAsync({
          ...data,
          slug,
          display_order: data.display_order ?? services.length,
        });
        toast({
          title: 'Service créé',
          message: `La prestation "${data.title}" a été ajoutée.`,
          type: 'success',
        });
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      toast({
        title: 'Erreur',
        message: err?.message || 'Échec de l’enregistrement.',
        type: 'error',
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteServiceMutation.mutateAsync(deletingId);
      toast({
        title: 'Service supprimé',
        message: 'La prestation a été supprimée.',
        type: 'info',
      });
      setDeletingId(null);
    } catch (err: any) {
      toast({
        title: 'Erreur',
        message: err?.message || 'Échec de la suppression.',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-zinc-100">
            Gestion des prestations & offres
          </h2>
          <p className="text-xs text-zinc-400">
            Configurez les services affichés sur le site et sélectionnables dans le formulaire de devis.
          </p>
        </div>
        <Button variant="accent" size="sm" onClick={openCreateDialog} className="gap-1.5 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          <span>Nouveau service</span>
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <div
            key={s.id}
            className={`rounded-xl border p-5 flex flex-col justify-between transition-all ${
              s.active
                ? 'border-zinc-800 bg-[#121417]'
                : 'border-zinc-850 bg-zinc-950/60 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="font-semibold text-zinc-100 text-sm">{s.title}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    s.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {s.active ? 'Actif' : 'Désactivé'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-3 mb-4 leading-relaxed">
                {s.description}
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-850 flex items-center justify-between text-xs text-zinc-400">
              <span className="font-mono text-zinc-200">{s.indicative_price}</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(s)}
                  className="h-7 w-7 text-zinc-400 hover:text-zinc-100"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeletingId(s.id)}
                  className="h-7 w-7 text-zinc-400 hover:text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent onClose={() => setIsDialogOpen(false)} className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Modifier le service' : 'Ajouter un nouveau service'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Intitulé du service *</label>
              <Input {...register('title')} placeholder="Ex: Montage Vidéo Short / TikTok / Reels" />
              {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Description détaillée *</label>
              <Textarea
                {...register('description')}
                rows={3}
                placeholder="Détaillez le travail inclus, les formats livrés..."
              />
              {errors.description && (
                <p className="text-xs text-red-400">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Tarif indicatif (Forfait / Projet en XOF)</label>
                <Input {...register('indicative_price')} placeholder="Ex: À partir de 50 000 XOF" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Délai indicatif</label>
                <Input {...register('indicative_duration')} placeholder="Ex: 48h à 72h" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Icône représentative</label>
              <Select {...register('icon')}>
                {AVAILABLE_ICONS.map((ic) => (
                  <option key={ic.value} value={ic.value}>
                    {ic.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-medium text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('active')}
                  className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500"
                />
                <span>Activer ce service sur le site et dans le formulaire</span>
              </label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="accent" isLoading={isSubmitting}>
                {editingService ? 'Mettre à jour' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Supprimer la prestation"
        description="Cette prestation ne sera plus proposée aux visiteurs."
        onConfirm={handleDelete}
      />
    </div>
  );
}
