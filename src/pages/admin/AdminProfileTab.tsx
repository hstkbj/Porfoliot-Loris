import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileFormData } from '../../schemas';
import { useProfile, useUpdateProfile } from '../../hooks/useData';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../components/ui/toast';
import { Save, User, CheckCircle2 } from 'lucide-react';

export function AdminProfileTab() {
  const { data: profile, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      professional_name: '',
      job_title: '',
      short_bio: '',
      bio: '',
      hero_title: '',
      hero_description: '',
      photo_url: '',
      years_experience: 7,
      availability: true,
      email: '',
      phone: '',
      location: '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        first_name: profile.first_name,
        last_name: profile.last_name,
        professional_name: profile.professional_name || '',
        job_title: profile.job_title,
        short_bio: profile.short_bio,
        bio: profile.bio,
        hero_title: profile.hero_title || '',
        hero_description: profile.hero_description || '',
        photo_url: profile.photo_url || '',
        years_experience: profile.years_experience,
        availability: profile.availability,
        email: profile.email,
        phone: profile.phone || '',
        location: profile.location || '',
      });
    }
  }, [profile, reset]);

  const watchAvailability = watch('availability');

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfileMutation.mutateAsync({
        ...data,
        years_experience: Number(data.years_experience),
      });
      toast({
        title: 'Profil mis à jour',
        message: 'Les informations du profil public ont été sauvegardées.',
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Erreur',
        message: err?.message || 'Échec de la mise à jour du profil.',
        type: 'error',
      });
    }
  };

  if (isLoading) {
    return <div className="text-zinc-400 text-xs py-10">Chargement du profil...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-display text-xl font-bold text-zinc-100">
          Profil & Biographie professionnelle
        </h2>
        <p className="text-xs text-zinc-400">
          Modifiez vos informations présentées sur les pages Accueil, À propos et Contact.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Availability Switch Box */}
        <div className="rounded-xl border border-zinc-800 bg-[#121417] p-5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-semibold text-zinc-100 text-xs flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  watchAvailability ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
                }`}
              />
              Disponibilité pour nouveaux projets
            </span>
            <p className="text-[11px] text-zinc-400">
              Affiche le macaron "Disponible pour nouveaux projets" ou "Planning complet" dans la barre de navigation et sur l'accueil.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              {...register('availability')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Identity & titles */}
        <div className="rounded-xl border border-zinc-800 bg-[#121417] p-6 space-y-4">
          <h3 className="font-display text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
            Identité & Métier
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Prénom *</label>
              <Input {...register('first_name')} />
              {errors.first_name && (
                <p className="text-xs text-red-400">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Nom *</label>
              <Input {...register('last_name')} />
              {errors.last_name && (
                <p className="text-xs text-red-400">{errors.last_name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Nom de marque / Studio</label>
              <Input {...register('professional_name')} placeholder="Ex: Alexandre Roche Motion" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Intitulé de poste officiel *</label>
              <Input {...register('job_title')} placeholder="Monteur Vidéo & Motion Designer Senior" />
              {errors.job_title && (
                <p className="text-xs text-red-400">{errors.job_title.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Années d'expérience *</label>
              <Input
                type="number"
                {...register('years_experience', { valueAsNumber: true })}
                placeholder="7"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Titre d'accroche Hero</label>
              <Input {...register('hero_title')} placeholder="MONTEUR VIDÉO & MOTION DESIGNER" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">URL Photo de profil *</label>
              <Input {...register('photo_url')} placeholder="https://images.unsplash.com/..." />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">Texte court d'accroche Hero</label>
            <Input {...register('hero_description')} placeholder="Du spot publicitaire percutant à..." />
          </div>
        </div>

        {/* Bios */}
        <div className="rounded-xl border border-zinc-800 bg-[#121417] p-6 space-y-4">
          <h3 className="font-display text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
            Biographies
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">
              Bio courte (affichée en pied de page et résumés) *
            </label>
            <Input {...register('short_bio')} />
            {errors.short_bio && (
              <p className="text-xs text-red-400">{errors.short_bio.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">
              Biographie complète (page À propos) *
            </label>
            <Textarea
              {...register('bio')}
              rows={6}
              placeholder="Racontez votre parcours, votre passion pour l'audiovisuel, vos types de projets favoris..."
            />
            {errors.bio && <p className="text-xs text-red-400">{errors.bio.message}</p>}
          </div>
        </div>

        {/* Contact info */}
        <div className="rounded-xl border border-zinc-800 bg-[#121417] p-6 space-y-4">
          <h3 className="font-display text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
            Coordonnées du monteur
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Email professionnel *</label>
              <Input type="email" {...register('email')} />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Téléphone</label>
              <Input {...register('phone')} placeholder="+33 6 42 19 88 05" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Localisation</label>
              <Input {...register('location')} placeholder="Paris, France / Remote" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="accent"
            size="lg"
            isLoading={isSubmitting}
            className="gap-2 text-xs font-semibold px-6"
          >
            <Save className="h-4 w-4" />
            <span>Enregistrer les modifications</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
