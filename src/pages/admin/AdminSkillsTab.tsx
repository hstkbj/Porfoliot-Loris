import React, { useState } from 'react';
import { useSkills, useCreateSkill, useUpdateSkill, useDeleteSkill } from '../../hooks/useData';
import { Skill } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { useToast } from '../../components/ui/toast';
import { Plus, Edit2, Trash2, Wrench } from 'lucide-react';

export function AdminSkillsTab() {
  const { data: skills = [] } = useSkills();
  const createSkillMutation = useCreateSkill();
  const updateSkillMutation = useUpdateSkill();
  const deleteSkillMutation = useDeleteSkill();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Logiciel');
  const [level, setLevel] = useState(90);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreate = () => {
    setEditingSkill(null);
    setName('');
    setCategory('Logiciel');
    setLevel(90);
    setIsDialogOpen(true);
  };

  const openEdit = (s: Skill) => {
    setEditingSkill(s);
    setName(s.name);
    setCategory(s.category);
    setLevel(s.level);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingSkill) {
        await updateSkillMutation.mutateAsync({
          id: editingSkill.id,
          skill: { name, category, level, display_order: editingSkill.display_order },
        });
        toast({ title: 'Compétence modifiée', message: `${name} a été mise à jour.` });
      } else {
        await createSkillMutation.mutateAsync({
          name,
          category,
          level,
          display_order: skills.length,
        });
        toast({ title: 'Compétence ajoutée', message: `${name} a été ajoutée.` });
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      toast({ title: 'Erreur', message: err?.message, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteSkillMutation.mutateAsync(deletingId);
      toast({ title: 'Supprimée', message: 'La compétence a été retirée.', type: 'info' });
      setDeletingId(null);
    } catch (err: any) {
      toast({ title: 'Erreur', message: err?.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-zinc-100">
            Compétences & Logiciels
          </h2>
          <p className="text-xs text-zinc-400">
            Gérez les logiciels et expertises affichés sur la page d'accueil et à propos.
          </p>
        </div>
        <Button variant="accent" size="sm" onClick={openCreate} className="gap-1.5 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          <span>Ajouter une compétence</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {skills.map((s) => (
          <div
            key={s.id}
            className="rounded-xl border border-zinc-800 bg-[#121417] p-4 flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="font-semibold text-xs text-zinc-100 block">{s.name}</span>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                <span>{s.category}</span>
                <span>•</span>
                <span>{s.level}%</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEdit(s)}
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
        ))}
      </div>

      {/* Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent onClose={() => setIsDialogOpen(false)} className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSkill ? 'Modifier la compétence' : 'Nouvelle compétence'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Nom du logiciel ou compétence</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: DaVinci Resolve Studio"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Catégorie</label>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Logiciel">Logiciel de montage / motion</option>
                <option value="Montage">Technique de montage</option>
                <option value="Motion Design">Motion Design & 3D</option>
                <option value="Étalonnage">Étalonnage & Colorimétrie</option>
                <option value="Audio">Sound Design & Mixage</option>
              </Select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <label className="font-medium text-zinc-300">Niveau de maîtrise</label>
                <span className="font-mono text-amber-400">{level}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
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
        title="Supprimer la compétence"
        description="Cette compétence sera retirée du profil."
        onConfirm={handleDelete}
      />
    </div>
  );
}
