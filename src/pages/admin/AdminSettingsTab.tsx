import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { siteSettingsSchema, SiteSettingsFormData } from '../../schemas';
import { useSiteSettings, useUpdateSiteSettings } from '../../hooks/useData';
import { DEFAULT_BUDGET_TIERS } from '../../services/initialData';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../components/ui/toast';
import {
  Save,
  Lock,
  ShieldCheck,
  Database,
  Coins,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

const PRESET_TIERS = {
  accessible: [
    'Moins de 25 000 XOF',
    '25 000 - 50 000 XOF',
    '50 000 - 100 000 XOF',
    '100 000 - 250 000 XOF',
    '250 000 - 500 000 XOF',
    'Plus de 500 000 XOF',
  ],
  standard: [
    'Moins de 50 000 XOF',
    '50 000 - 100 000 XOF',
    '100 000 - 250 000 XOF',
    '250 000 - 500 000 XOF',
    '500 000 - 1 000 000 XOF',
    'Plus de 1 000 000 XOF',
  ],
  corporate: [
    'Moins de 100 000 XOF',
    '100 000 - 300 000 XOF',
    '300 000 - 750 000 XOF',
    '750 000 - 1 500 000 XOF',
    '1 500 000 - 2 500 000 XOF',
    'Plus de 2 500 000 XOF',
  ],
};

export function AdminSettingsTab() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSettingsMutation = useUpdateSiteSettings();
  const { updatePassword } = useAuth();
  const { toast } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Budget tiers state
  const [budgetTiers, setBudgetTiers] = useState<string[]>(DEFAULT_BUDGET_TIERS);
  const [newTierInput, setNewTierInput] = useState('');
  const [isSavingTiers, setIsSavingTiers] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SiteSettingsFormData>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      site_name: '',
      site_description: '',
      contact_email: '',
      contact_phone: '',
      location: '',
      copyright_text: '',
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        site_name: settings.site_name,
        site_description: settings.site_description,
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone || '',
        location: settings.location || '',
        copyright_text: settings.copyright_text,
      });

      if (settings.budget_tiers && settings.budget_tiers.length > 0) {
        setBudgetTiers(settings.budget_tiers);
      }
    }
  }, [settings, reset]);

  const handleAddTier = () => {
    const trimmed = newTierInput.trim();
    if (!trimmed) return;
    if (budgetTiers.includes(trimmed)) {
      toast({
        title: 'Tranche déjà existante',
        message: 'Cette option budgétaire figure déjà dans la liste.',
        type: 'error',
      });
      return;
    }
    setBudgetTiers([...budgetTiers, trimmed]);
    setNewTierInput('');
  };

  const handleRemoveTier = (index: number) => {
    if (budgetTiers.length <= 1) {
      toast({
        title: 'Suppression impossible',
        message: 'Il doit rester au moins une tranche budgétaire.',
        type: 'error',
      });
      return;
    }
    setBudgetTiers(budgetTiers.filter((_, i) => i !== index));
  };

  const handleUpdateTier = (index: number, value: string) => {
    const updated = [...budgetTiers];
    updated[index] = value;
    setBudgetTiers(updated);
  };

  const handleMoveTier = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === budgetTiers.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...budgetTiers];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setBudgetTiers(updated);
  };

  const applyPreset = (preset: string[], label: string) => {
    setBudgetTiers(preset);
    toast({
      title: 'Préréglage appliqué',
      message: `La configuration "${label}" est active. Pensez à enregistrer vos modifications.`,
      type: 'info',
    });
  };

  const handleSaveBudgetTiers = async () => {
    setIsSavingTiers(true);
    try {
      const cleanTiers = budgetTiers.map((t) => t.trim()).filter(Boolean);
      await updateSettingsMutation.mutateAsync({
        budget_tiers: cleanTiers,
      });
      toast({
        title: 'Tranches enregistrées',
        message: 'Les options de budget du formulaire client ont été mises à jour.',
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Erreur',
        message: err?.message || 'Impossible d’enregistrer les tranches.',
        type: 'error',
      });
    } finally {
      setIsSavingTiers(false);
    }
  };

  const onSubmit = async (data: SiteSettingsFormData) => {
    try {
      await updateSettingsMutation.mutateAsync({
        ...data,
        budget_tiers: budgetTiers.map((t) => t.trim()).filter(Boolean),
      });
      toast({
        title: 'Paramètres mis à jour',
        message: 'Les réglages du site et les tranches budgétaires ont été enregistrés.',
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Erreur',
        message: err?.message || 'Échec de la mise à jour.',
        type: 'error',
      });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({
        title: 'Mot de passe trop court',
        message: 'Le mot de passe doit contenir au moins 6 caractères.',
        type: 'error',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Mots de passe différents',
        message: 'Les deux mots de passe saisis ne correspondent pas.',
        type: 'error',
      });
      return;
    }

    setPasswordLoading(true);
    try {
      await updatePassword(newPassword);
      toast({
        title: 'Mot de passe mis à jour',
        message: 'Votre nouveau mot de passe a été configuré avec succès.',
        type: 'success',
      });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast({
        title: 'Erreur',
        message: err?.message || 'Impossible de mettre à jour le mot de passe.',
        type: 'error',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="font-display text-xl font-bold text-zinc-100">
          Paramètres du site & Sécurité
        </h2>
        <p className="text-xs text-zinc-400">
          Gérez l’identité du site, les coordonnées globales et vos identifiants d’accès.
        </p>
      </div>

      {/* Storage Backend status banner */}
      <div className="rounded-xl border border-zinc-800 bg-[#121417] p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-amber-400">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-zinc-200 block">
              Moteur de données actif :{' '}
              <span className="text-amber-400 font-mono">
                {isSupabaseConfigured ? 'Supabase Cloud (PostgreSQL)' : 'Mode LocalStorage Hybride (Prêt à brancher)'}
              </span>
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {isSupabaseConfigured
                ? 'Connecté à votre projet Supabase avec Row Level Security et Storage buckets.'
                : 'Les modifications sont sauvegardées immédiatement en stockage local persistant. Pour connecter Supabase, renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.'}
            </p>
          </div>
        </div>
      </div>

      {/* General Settings Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-zinc-800 bg-[#121417] p-6 space-y-5">
        <h3 className="font-display text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
          Informations générales
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">Nom du site / Studio *</label>
            <Input {...register('site_name')} />
            {errors.site_name && (
              <p className="text-xs text-red-400">{errors.site_name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">Localisation affichée</label>
            <Input {...register('location')} placeholder="Paris, France" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-300">
            Description générale du site (SEO & Métadonnées) *
          </label>
          <Textarea {...register('site_description')} rows={3} />
          {errors.site_description && (
            <p className="text-xs text-red-400">{errors.site_description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">Email de contact principal *</label>
            <Input type="email" {...register('contact_email')} />
            {errors.contact_email && (
              <p className="text-xs text-red-400">{errors.contact_email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">Téléphone de contact</label>
            <Input {...register('contact_phone')} placeholder="+33 6 42 19 88 05" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-300">Mention de Copyright *</label>
          <Input {...register('copyright_text')} placeholder="© 2026 Alexandre Roche. Tous droits réservés." />
          {errors.copyright_text && (
            <p className="text-xs text-red-400">{errors.copyright_text.message}</p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="accent"
            size="sm"
            isLoading={isSubmitting}
            className="gap-2 text-xs font-semibold"
          >
            <Save className="h-4 w-4" />
            <span>Enregistrer les paramètres</span>
          </Button>
        </div>
      </form>

      {/* Budget Tiers Management Card */}
      <div className="rounded-xl border border-zinc-800 bg-[#121417] p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-zinc-200">
              <Coins className="h-4 w-4 text-amber-400" />
              <h3 className="font-display text-sm font-bold uppercase tracking-wider font-mono">
                Tranches budgétaires du formulaire client (XOF)
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Gérez les options de budget proposées à vos prospects lors de leur demande de devis. Ajustez-les selon votre positionnement.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset(DEFAULT_BUDGET_TIERS, 'Standard par défaut')}
              className="text-xs gap-1.5 h-8 border-zinc-700 text-zinc-300 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Défaut</span>
            </Button>
            <Button
              type="button"
              variant="accent"
              size="sm"
              onClick={handleSaveBudgetTiers}
              isLoading={isSavingTiers}
              className="text-xs gap-1.5 h-8 font-semibold"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Enregistrer les tranches</span>
            </Button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Préréglages de montants réalistes :</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset(PRESET_TIERS.accessible, 'Freelance Accessible')}
              className="px-3 py-1.5 rounded-lg border border-zinc-700/70 bg-zinc-900/60 hover:border-amber-500/50 hover:bg-zinc-800 text-xs text-zinc-300 transition-colors"
            >
              🌱 Accessible (25k — 500k XOF)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(PRESET_TIERS.standard, 'Standard Polyvalent')}
              className="px-3 py-1.5 rounded-lg border border-zinc-700/70 bg-zinc-900/60 hover:border-amber-500/50 hover:bg-zinc-800 text-xs text-zinc-300 transition-colors"
            >
              ⭐ Standard Équilibré (50k — 1M XOF)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(PRESET_TIERS.corporate, 'Grands Comptes & Agence')}
              className="px-3 py-1.5 rounded-lg border border-zinc-700/70 bg-zinc-900/60 hover:border-amber-500/50 hover:bg-zinc-800 text-xs text-zinc-300 transition-colors"
            >
              🏢 Grands Comptes (100k — 2.5M+ XOF)
            </button>
          </div>
        </div>

        {/* List of Tiers */}
        <div className="space-y-2.5">
          <label className="text-xs font-medium text-zinc-300 block">
            Liste ordonnée des tranches ({budgetTiers.length})
          </label>
          <div className="space-y-2">
            {budgetTiers.map((tier, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800/80 rounded-lg p-2 transition-all hover:border-zinc-700"
              >
                <span className="flex-shrink-0 w-7 text-center font-mono text-xs text-zinc-500 font-semibold">
                  #{index + 1}
                </span>

                <Input
                  value={tier}
                  onChange={(e) => handleUpdateTier(index, e.target.value)}
                  className="flex-1 text-xs font-mono h-8 bg-black/40 border-zinc-800 focus:border-amber-500 text-zinc-200"
                  placeholder="Ex: 50 000 - 100 000 XOF"
                />

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveTier(index, 'up')}
                    disabled={index === 0}
                    title="Monter"
                    aria-label="Monter"
                    className="p-1.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveTier(index, 'down')}
                    disabled={index === budgetTiers.length - 1}
                    title="Descendre"
                    aria-label="Descendre"
                    className="p-1.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveTier(index)}
                    title="Supprimer"
                    aria-label="Supprimer"
                    className="p-1.5 rounded text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Tier */}
        <div className="pt-1">
          <label className="text-xs font-medium text-zinc-300 block mb-1.5">
            Ajouter une nouvelle tranche personnalisée
          </label>
          <div className="flex gap-2">
            <Input
              value={newTierInput}
              onChange={(e) => setNewTierInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTier();
                }
              }}
              placeholder="Ex: 75 000 - 150 000 XOF"
              className="text-xs font-mono h-9 bg-black/40 border-zinc-800 focus:border-amber-500 text-zinc-200"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddTier}
              className="text-xs gap-1.5 flex-shrink-0 h-9"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Ajouter</span>
            </Button>
          </div>
        </div>

        {/* Form Preview */}
        <div className="rounded-lg bg-black/30 border border-zinc-800/60 p-3 space-y-1.5 text-xs">
          <span className="text-zinc-400 font-medium block">
            Aperçu immédiat dans le formulaire de brief client :
          </span>
          <div className="flex flex-wrap gap-1.5">
            {budgetTiers.map((tier, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 font-mono text-[11px]"
              >
                {tier}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <form onSubmit={handlePasswordChange} className="rounded-xl border border-zinc-800 bg-[#121417] p-6 space-y-4">
        <div className="flex items-center gap-2 text-zinc-200">
          <Lock className="h-4 w-4 text-amber-400" />
          <h3 className="font-display text-sm font-bold uppercase tracking-wider font-mono">
            Sécurité — Mot de passe administrateur
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">Nouveau mot de passe</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">Confirmer le nouveau mot de passe</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            isLoading={passwordLoading}
            className="text-xs"
          >
            Mettre à jour mon mot de passe
          </Button>
        </div>
      </form>
    </div>
  );
}
