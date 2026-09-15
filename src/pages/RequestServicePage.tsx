import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { serviceRequestSchema, ServiceRequestFormData } from '../schemas';
import { useServices, useCreateServiceRequest, useSiteSettings } from '../hooks/useData';
import { DEFAULT_BUDGET_TIERS } from '../services/initialData';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select } from '../components/ui/select';
import { useToast } from '../components/ui/toast';
import { CheckCircle2, Send, Upload, ArrowLeft } from 'lucide-react';

interface RequestServicePageProps {
  initialServiceId?: string;
  onBack: () => void;
}

export function RequestServicePage({ initialServiceId, onBack }: RequestServicePageProps) {
  const { data: services = [] } = useServices();
  const { data: settings } = useSiteSettings();
  const createRequestMutation = useCreateServiceRequest();
  const { toast } = useToast();
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);

  const budgetOptions = settings?.budget_tiers && settings.budget_tiers.length > 0
    ? settings.budget_tiers
    : DEFAULT_BUDGET_TIERS;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceRequestFormData>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      company: '',
      service_id: initialServiceId || '',
      budget: '',
      desired_date: '',
      description: '',
      reference_url: '',
      attachment_url: '',
    },
  });

  useEffect(() => {
    if (initialServiceId) {
      setValue('service_id', initialServiceId);
    } else if (services.length > 0) {
      setValue('service_id', services[0].id);
    }
  }, [initialServiceId, services, setValue]);

  const handleFileSimulation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        toast({
          title: 'Fichier trop volumineux',
          message: 'La taille maximale autorisée pour le brief est de 25 Mo.',
          type: 'error',
        });
        return;
      }
      setAttachedFileName(file.name);
      // Create local object URL for preview / storage reference
      const fakeUrl = URL.createObjectURL(file);
      setValue('attachment_url', fakeUrl);
      toast({
        title: 'Pièce jointe ajoutée',
        message: `${file.name} est prêt pour l'envoi.`,
        type: 'info',
      });
    }
  };

  const onSubmit = async (data: ServiceRequestFormData) => {
    try {
      await createRequestMutation.mutateAsync({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        company: data.company || undefined,
        service_id: data.service_id,
        budget: data.budget || undefined,
        desired_date: data.desired_date || undefined,
        description: data.description,
        reference_url: data.reference_url || undefined,
        attachment_url: data.attachment_url || undefined,
      });

      setSubmittedSuccess(true);
      reset();
      setAttachedFileName(null);
      toast({
        title: 'Demande transmise avec succès',
        message: 'Votre projet a bien été enregistré. Je reviens vers vous sous 24h ouvrées.',
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Erreur lors de l’envoi',
        message: err?.message || 'Une erreur est survenue lors de l’envoi. Veuillez réessayer.',
        type: 'error',
      });
    }
  };

  if (submittedSuccess) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="rounded-2xl border border-emerald-500/30 bg-[#121417] p-8 sm:p-12 space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold text-zinc-100">
              Demande bien reçue !
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Merci pour votre confiance. Vos informations et éléments de projet ont été enregistrés. Je vais étudier vos besoins et vous recontacter par email ou téléphone dans les 24h avec un devis adapté.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <Button variant="accent" onClick={() => setSubmittedSuccess(false)}>
              Envoyer une autre demande
            </Button>
            <Button variant="outline" onClick={onBack}>
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-amber-400 transition-colors font-mono cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour</span>
        </button>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase font-mono">
          Nouveau Projet
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-zinc-100">
          Demander un devis ou une prestation
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Décrivez votre projet audiovisuel, vos attentes et vos délais. Remplissez ce formulaire pour obtenir une estimation personnalisée sous 24h.
        </p>
      </div>

      {/* Form Container */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-zinc-800 bg-[#121417] p-6 sm:p-10 space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Nom complet <span className="text-amber-400">*</span>
            </label>
            <Input
              {...register('full_name')}
              placeholder="Ex: Sophie Martin"
              className={errors.full_name ? 'border-red-500' : ''}
            />
            {errors.full_name && (
              <p className="text-xs text-red-400">{errors.full_name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Adresse email <span className="text-amber-400">*</span>
            </label>
            <Input
              type="email"
              {...register('email')}
              placeholder="sophie@entreprise.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Téléphone <span className="text-amber-400">*</span>
            </label>
            <Input
              type="tel"
              {...register('phone')}
              placeholder="+33 6 12 34 56 78"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-xs text-red-400">{errors.phone.message}</p>
            )}
          </div>

          {/* Company */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Entreprise ou Agence <span className="text-zinc-500">(facultatif)</span>
            </label>
            <Input
              {...register('company')}
              placeholder="Ex: Studio Lumina"
            />
          </div>
        </div>

        {/* Service selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">
            Prestation souhaitée <span className="text-amber-400">*</span>
          </label>
          <Select {...register('service_id')}>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} {s.indicative_price ? `(${s.indicative_price})` : ''}
              </option>
            ))}
          </Select>
          {errors.service_id && (
            <p className="text-xs text-red-400">{errors.service_id.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Budget */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Budget prévisionnel <span className="text-zinc-500">(indicatif)</span>
            </label>
            <Select {...register('budget')}>
              <option value="">Sélectionnez une tranche (XOF)</option>
              {budgetOptions.map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </Select>
          </div>

          {/* Desired Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Date de livraison souhaitée <span className="text-zinc-500">(idéale)</span>
            </label>
            <Input
              {...register('desired_date')}
              placeholder="Ex: Sous 2 semaines, Fin du mois..."
            />
          </div>
        </div>

        {/* Project Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">
            Description détaillée du projet <span className="text-amber-400">*</span>
          </label>
          <Textarea
            {...register('description')}
            rows={4}
            placeholder="Parlez-moi de votre vidéo : format cible (16:9, 9:16), durée approximative, ambiance recherchée, volume de rushes disponibles..."
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && (
            <p className="text-xs text-red-400">{errors.description.message}</p>
          )}
        </div>

        {/* Reference URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">
            Lien vers références ou dossier de rushes <span className="text-zinc-500">(Google Drive, WeTransfer, Frame.io, YouTube...)</span>
          </label>
          <Input
            type="url"
            {...register('reference_url')}
            placeholder="https://..."
            className={errors.reference_url ? 'border-red-500' : ''}
          />
          {errors.reference_url && (
            <p className="text-xs text-red-400">{errors.reference_url.message}</p>
          )}
        </div>

        {/* Attachment upload field */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">
            Joindre un document de brief ou script <span className="text-zinc-500">(PDF, document max 25 Mo)</span>
          </label>
          <div className="relative flex items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-900/40 p-4 hover:border-zinc-500 transition-colors">
            <input
              type="file"
              onChange={handleFileSimulation}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              accept=".pdf,.doc,.docx,.txt"
            />
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Upload className="h-4 w-4 text-amber-400" />
              <span>
                {attachedFileName ? (
                  <strong className="text-zinc-200">{attachedFileName}</strong>
                ) : (
                  'Glissez votre fichier ici ou cliquez pour parcourir'
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="accent"
            size="lg"
            isLoading={isSubmitting}
            className="w-full justify-center text-sm font-semibold gap-2"
          >
            <span>Transmettre ma demande de devis</span>
            <Send className="h-4 w-4" />
          </Button>
          <p className="mt-2 text-[11px] text-zinc-500 text-center">
            Aucun engagement. Vos informations restent strictement confidentielles et protégées.
          </p>
        </div>
      </form>
    </div>
  );
}
