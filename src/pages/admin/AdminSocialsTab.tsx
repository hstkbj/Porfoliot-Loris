import React, { useState } from 'react';
import {
  useSocialLinks,
  useCreateSocialLink,
  useUpdateSocialLink,
  useDeleteSocialLink,
} from '../../hooks/useData';
import { SocialLink } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { useToast } from '../../components/ui/toast';
import { Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';

const COMMON_PLATFORMS = [
  'Instagram',
  'LinkedIn',
  'YouTube',
  'Vimeo',
  'TikTok',
  'Behance',
  'ArtStation',
  'Twitter / X',
];

export function AdminSocialsTab() {
  const { data: socials = [] } = useSocialLinks(false); // get all including inactive
  const createSocialMutation = useCreateSocialLink();
  const updateSocialMutation = useUpdateSocialLink();
  const deleteSocialMutation = useDeleteSocialLink();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSocial, setEditingSocial] = useState<SocialLink | null>(null);
  const [platform, setPlatform] = useState('Instagram');
  const [url, setUrl] = useState('');
  const [active, setActive] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreate = () => {
    setEditingSocial(null);
    setPlatform('Instagram');
    setUrl('');
    setActive(true);
    setIsDialogOpen(true);
  };

  const openEdit = (s: SocialLink) => {
    setEditingSocial(s);
    setPlatform(s.platform);
    setUrl(s.url);
    setActive(s.active);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    try {
      if (editingSocial) {
        await updateSocialMutation.mutateAsync({
          id: editingSocial.id,
          social: { platform, url, icon: platform.toLowerCase(), active, display_order: editingSocial.display_order },
        });
        toast({ title: 'Réseau modifié', message: `${platform} a été mis à jour.` });
      } else {
        await createSocialMutation.mutateAsync({
          platform,
          url,
          icon: platform.toLowerCase(),
          active,
          display_order: socials.length,
        });
        toast({ title: 'Réseau ajouté', message: `${platform} a été ajouté.` });
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      toast({ title: 'Erreur', message: err?.message, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteSocialMutation.mutateAsync(deletingId);
      toast({ title: 'Supprimé', message: 'Le réseau a été retiré.', type: 'info' });
      setDeletingId(null);
    } catch (err: any) {
      toast({ title: 'Erreur', message: err?.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-zinc-100">
            Réseaux Sociaux & Plateformes
          </h2>
          <p className="text-xs text-zinc-400">
            Configurez vos liens visibles en pied de page, sur la page d'accueil et dans la page contact.
          </p>
        </div>
        <Button variant="accent" size="sm" onClick={openCreate} className="gap-1.5 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          <span>Ajouter un réseau</span>
        </Button>
      </div>

      <div className="space-y-2">
        {socials.map((s) => (
          <div
            key={s.id}
            className={`rounded-xl border p-4 flex items-center justify-between transition-colors ${
              s.active ? 'border-zinc-800 bg-[#121417]' : 'border-zinc-850 bg-zinc-950/40 opacity-60'
            }`}
          >
            <div className="space-y-0.5 overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-zinc-100">{s.platform}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.2 rounded-full ${
                    s.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {s.active ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-400 hover:text-amber-400 flex items-center gap-1 truncate"
              >
                <span>{s.url}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEdit(s)}
                className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeletingId(s.id)}
                className="h-8 w-8 text-zinc-400 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent onClose={() => setIsDialogOpen(false)} className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSocial ? 'Modifier le réseau' : 'Nouveau réseau social'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Plateforme</label>
              <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                {COMMON_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">URL du profil *</label>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                required
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-medium text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-amber-500"
                />
                <span>Afficher sur le site public</span>
              </label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="accent">
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Supprimer le réseau social"
        description="Ce lien ne sera plus affiché sur le site."
        onConfirm={handleDelete}
      />
    </div>
  );
}
