import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, ProjectFormData } from '../../schemas';
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from '../../hooks/useData';
import { Project, ProjectCategory } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { useToast } from '../../components/ui/toast';
import { slugify } from '../../lib/utils';
import { Plus, Edit2, Trash2, Eye, ExternalLink, Film, Check, AlertCircle } from 'lucide-react';

const CATEGORIES: ProjectCategory[] = [
  'Montage vidéo',
  'Motion Design',
  'Publicité',
  'Réseaux sociaux',
  'Clip musical',
  'Vidéo corporate',
  'YouTube',
  'Animation',
];

export function AdminProjectsTab() {
  const { data: projects = [], isLoading } = useProjects(false);
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  const { toast } = useToast();

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      slug: '',
      short_description: '',
      description: '',
      client: '',
      year: new Date().getFullYear(),
      category: 'Montage vidéo',
      thumbnail_url: '',
      video_url: '',
      tools: 'Adobe Premiere Pro, After Effects',
      featured: false,
      published: true,
      external_url: '',
    },
  });

  const watchTitle = watch('title');

  const openCreateDialog = () => {
    setEditingProject(null);
    reset({
      title: '',
      slug: '',
      short_description: '',
      description: '',
      client: '',
      year: new Date().getFullYear(),
      category: 'Montage vidéo',
      thumbnail_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      tools: 'Premiere Pro, After Effects',
      featured: false,
      published: true,
      external_url: '',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    reset({
      title: project.title,
      slug: project.slug,
      short_description: project.short_description,
      description: project.description,
      client: project.client,
      year: project.year,
      category: project.category,
      thumbnail_url: project.thumbnail_url,
      video_url: project.video_url,
      tools: Array.isArray(project.tools) ? project.tools.join(', ') : project.tools,
      featured: project.featured,
      published: project.published,
      external_url: project.external_url || '',
    });
    setIsDialogOpen(true);
  };

  const handleTitleBlur = () => {
    if (!editingProject && watchTitle) {
      setValue('slug', slugify(watchTitle));
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const toolsArray = typeof data.tools === 'string'
        ? data.tools.split(',').map((t) => t.trim()).filter(Boolean)
        : data.tools;

      const payload = {
        title: data.title,
        slug: data.slug || slugify(data.title),
        short_description: data.short_description,
        description: data.description,
        client: data.client,
        year: Number(data.year),
        category: data.category,
        thumbnail_url: data.thumbnail_url,
        video_url: data.video_url,
        tools: toolsArray,
        featured: Boolean(data.featured),
        published: Boolean(data.published),
        display_order: editingProject ? editingProject.display_order : projects.length,
        external_url: data.external_url || undefined,
      };

      if (editingProject) {
        await updateProjectMutation.mutateAsync({
          id: editingProject.id,
          updates: payload,
        });
        toast({
          title: 'Projet mis à jour',
          message: `Le projet "${payload.title}" a été modifié avec succès.`,
          type: 'success',
        });
      } else {
        await createProjectMutation.mutateAsync(payload);
        toast({
          title: 'Projet créé',
          message: `Le projet "${payload.title}" a été ajouté au portfolio.`,
          type: 'success',
        });
      }

      setIsDialogOpen(false);
    } catch (err: any) {
      toast({
        title: 'Erreur',
        message: err?.message || 'Une erreur est survenue lors de l’enregistrement.',
        type: 'error',
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteProjectMutation.mutateAsync(deletingId);
      toast({
        title: 'Projet supprimé',
        message: 'Le projet a été retiré de la base de données.',
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
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-zinc-100">
            Gestion des réalisations & projets
          </h2>
          <p className="text-xs text-zinc-400">
            {projects.length} projet(s) enregistré(s) au total.
          </p>
        </div>
        <Button variant="accent" size="sm" onClick={openCreateDialog} className="gap-1.5 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          <span>Nouveau projet</span>
        </Button>
      </div>

      {/* Projects Table / Card List */}
      <div className="rounded-xl border border-zinc-800 bg-[#121417] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-zinc-800 bg-zinc-900/80 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-4 py-3">Miniature & Projet</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Client & Année</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    Aucun projet pour le moment. Cliquez sur "Nouveau projet" pour en ajouter.
                  </td>
                </tr>
              ) : (
                projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={proj.thumbnail_url}
                          alt={proj.title}
                          className="h-10 w-16 rounded object-cover bg-zinc-900 shrink-0"
                        />
                        <div className="overflow-hidden">
                          <span className="font-semibold text-zinc-100 block truncate max-w-xs">
                            {proj.title}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            /{proj.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-[11px]">
                        {proj.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-200">{proj.client}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{proj.year}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            proj.published ? 'bg-emerald-400' : 'bg-zinc-600'
                          }`}
                        />
                        <span className="text-[11px] font-mono">
                          {proj.published ? 'En ligne' : 'Brouillon'}
                        </span>
                        {proj.featured && (
                          <span className="rounded bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.5">
                            ★ Une
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(proj)}
                        className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
                        title="Modifier"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingId(proj.id)}
                        className="h-8 w-8 text-zinc-400 hover:text-red-400"
                        title="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Form Modal (Add & Edit) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent onClose={() => setIsDialogOpen(false)} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? 'Modifier la réalisation' : 'Créer une nouvelle réalisation'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Titre du projet *</label>
                <Input
                  {...register('title')}
                  placeholder="Ex: Campagne Nike Phantom"
                  onBlur={handleTitleBlur}
                />
                {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Slug URL *</label>
                <Input {...register('slug')} placeholder="campagne-nike-phantom" />
                {errors.slug && <p className="text-xs text-red-400">{errors.slug.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Client *</label>
                <Input {...register('client')} placeholder="Nike Football" />
                {errors.client && <p className="text-xs text-red-400">{errors.client.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Année *</label>
                <Input
                  type="number"
                  {...register('year', { valueAsNumber: true })}
                  placeholder="2026"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Catégorie *</label>
                <Select {...register('category')}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">
                Description courte (résumé pour carte) *
              </label>
              <Input
                {...register('short_description')}
                placeholder="Montage dynamique et effets sonores percutants..."
              />
              {errors.short_description && (
                <p className="text-xs text-red-400">{errors.short_description.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">
                Description détaillée & Contexte *
              </label>
              <Textarea
                {...register('description')}
                rows={4}
                placeholder="Détails de la mission, enjeux techniques, étalonnage DaVinci Resolve, motion design..."
              />
              {errors.description && (
                <p className="text-xs text-red-400">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">
                  URL Miniature / Cover *
                </label>
                <Input
                  {...register('thumbnail_url')}
                  placeholder="https://images.unsplash.com/..."
                />
                {errors.thumbnail_url && (
                  <p className="text-xs text-red-400">{errors.thumbnail_url.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">
                  URL Vidéo principale * (MP4 ou Embed)
                </label>
                <Input
                  {...register('video_url')}
                  placeholder="https://.../video.mp4"
                />
                {errors.video_url && (
                  <p className="text-xs text-red-400">{errors.video_url.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">
                  Logiciels / Outils (séparés par virgule)
                </label>
                <Input
                  {...register('tools')}
                  placeholder="Premiere Pro, After Effects, DaVinci Resolve"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">
                  Lien externe (diffusion)
                </label>
                <Input
                  {...register('external_url')}
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>

            {/* Checkboxes for status */}
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-medium text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('published')}
                  className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500"
                />
                <span>Publier sur le site public</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('featured')}
                  className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500"
                />
                <span>Mettre en avant sur la page d’accueil</span>
              </label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="accent" isLoading={isSubmitting}>
                {editingProject ? 'Mettre à jour' : 'Créer le projet'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Supprimer la réalisation"
        description="Êtes-vous sûr de vouloir supprimer définitivement ce projet ? Cette action est irréversible."
        onConfirm={handleDelete}
        confirmText="Supprimer définitivement"
      />
    </div>
  );
}
