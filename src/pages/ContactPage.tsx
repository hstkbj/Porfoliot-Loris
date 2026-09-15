import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactMessageSchema, ContactMessageFormData } from '../schemas';
import { useProfile, useSiteSettings, useSocialLinks, useCreateContactMessage } from '../hooks/useData';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../components/ui/toast';
import { Mail, Phone, MapPin, Send, CheckCircle2, ArrowUpRight } from 'lucide-react';

export function ContactPage() {
  const { data: profile } = useProfile();
  const { data: settings } = useSiteSettings();
  const { data: socialLinks = [] } = useSocialLinks();
  const createMessageMutation = useCreateContactMessage();
  const { toast } = useToast();
  const [sentSuccess, setSentSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactMessageFormData>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactMessageFormData) => {
    try {
      await createMessageMutation.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        subject: data.subject || undefined,
        message: data.message,
      });

      setSentSuccess(true);
      reset();
      toast({
        title: 'Message envoyé',
        message: 'Votre message a bien été transmis. Je vous répondrai dans les plus brefs délais.',
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Erreur',
        message: err?.message || 'Une erreur est survenue lors de l’envoi.',
        type: 'error',
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="max-w-2xl">
        <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase font-mono">
          Contact & Échange
        </span>
        <h1 className="font-display text-4xl font-extrabold text-zinc-100 mt-1">
          Parlons de votre futur projet
        </h1>
        <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
          Une question sur une prestation, une demande de disponibilité ou un projet de film ? N’hésitez pas à m’écrire ou à me contacter directement.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Direct info & Social networks */}
        <div className="lg:col-span-5 space-y-8">
          <div className="rounded-2xl border border-zinc-800 bg-[#121417] p-6 sm:p-8 space-y-6">
            <h3 className="font-display text-lg font-bold text-zinc-100">
              Coordonnées directes
            </h3>

            <div className="space-y-4 text-sm text-zinc-300">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-amber-400 shrink-0 mt-0.5">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs text-zinc-500 font-mono block">Email professionnel</span>
                  <a
                    href={`mailto:${settings?.contact_email || profile?.email}`}
                    className="font-medium text-zinc-200 hover:text-amber-400 transition-colors"
                  >
                    {settings?.contact_email || profile?.email || 'contact@roche-motion.com'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-amber-400 shrink-0 mt-0.5">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs text-zinc-500 font-mono block">Téléphone / WhatsApp</span>
                  <a
                    href={`tel:${settings?.contact_phone || profile?.phone}`}
                    className="font-medium text-zinc-200 hover:text-amber-400 transition-colors"
                  >
                    {settings?.contact_phone || profile?.phone || '+33 6 42 19 88 05'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-amber-400 shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs text-zinc-500 font-mono block">Localisation</span>
                  <span className="font-medium text-zinc-200">
                    {settings?.location || profile?.location || 'Paris, France & Remote'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links configured in DB */}
          {socialLinks.length > 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-[#121417] p-6 sm:p-8 space-y-4">
              <h3 className="font-display text-base font-bold text-zinc-100">
                Plateformes créatives & Réseaux
              </h3>
              <p className="text-xs text-zinc-400">
                Retrouvez mes travaux, showreels complets et coulisses de production sur les plateformes suivantes :
              </p>
              <div className="space-y-2 pt-1">
                {socialLinks.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border border-zinc-850 bg-zinc-900/60 px-3.5 py-2.5 text-xs text-zinc-300 hover:border-zinc-700 hover:text-amber-400 transition-colors"
                  >
                    <span className="font-medium">{s.platform}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-zinc-800 bg-[#121417] p-6 sm:p-10">
            {sentSuccess ? (
              <div className="py-12 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="font-display text-xl font-bold text-zinc-100">
                  Message envoyé avec succès !
                </h3>
                <p className="text-sm text-zinc-400 max-w-md mx-auto">
                  Votre message a été enregistré. Je consulte mes messages quotidiennement et vous répondrai dans les plus brefs délais.
                </p>
                <Button variant="outline" size="sm" onClick={() => setSentSuccess(false)}>
                  Envoyer un nouveau message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <h3 className="font-display text-xl font-bold text-zinc-100 mb-2">
                  Formulaire de contact
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">
                      Votre nom <span className="text-amber-400">*</span>
                    </label>
                    <Input
                      {...register('name')}
                      placeholder="Nom et prénom"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">
                      Votre email <span className="text-amber-400">*</span>
                    </label>
                    <Input
                      type="email"
                      {...register('email')}
                      placeholder="votre@email.com"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">
                      Téléphone <span className="text-zinc-500">(facultatif)</span>
                    </label>
                    <Input {...register('phone')} placeholder="+33 6..." />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">
                      Objet <span className="text-zinc-500">(facultatif)</span>
                    </label>
                    <Input {...register('subject')} placeholder="Ex: Montage spot TV" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">
                    Votre message <span className="text-amber-400">*</span>
                  </label>
                  <Textarea
                    {...register('message')}
                    rows={5}
                    placeholder="Écrivez votre message..."
                    className={errors.message ? 'border-red-500' : ''}
                  />
                  {errors.message && <p className="text-xs text-red-400">{errors.message.message}</p>}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="accent"
                    size="lg"
                    isLoading={isSubmitting}
                    className="w-full sm:w-auto px-8 gap-2"
                  >
                    <span>Envoyer le message</span>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
