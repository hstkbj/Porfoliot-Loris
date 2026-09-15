import { useServices } from '../hooks/useData';
import { ServiceCard } from '../components/services/ServiceCard';
import { Button } from '../components/ui/button';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface ServicesPageProps {
  onSelectService: (serviceId: string) => void;
}

export function ServicesPage({ onSelectService }: ServicesPageProps) {
  const { data: services = [] } = useServices();

  const workflowSteps = [
    {
      step: '01',
      title: 'Brief & Direction Artistique',
      desc: 'Analyse de vos objectifs, de votre audience cible, définition du moodboard et réception de vos rushes bruts via liaison sécurisée.',
    },
    {
      step: '02',
      title: 'Dérushage & Montage Cut (V1)',
      desc: 'Sélection des meilleures prises, assemblage narratif, synchronisation musicale et proposition d’un premier montage structurel.',
    },
    {
      step: '03',
      title: 'Motion Design & Sound Design',
      desc: 'Intégration des titrages animés, effets visuels, animations graphiques 2D/3D et conception de l’ambiance sonore immersive.',
    },
    {
      step: '04',
      title: 'Étalonnage & Export Master',
      desc: 'Color grading harmonisé, mixage audio aux normes de diffusion (TV / Web / Cinéma) et livraison des masters finaux dans tous les ratios (16:9, 9:16, 1:1, 4:5).',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-20">
      {/* Header */}
      <div className="max-w-2xl">
        <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase font-mono">
          Services Audiovisuels
        </span>
        <h1 className="font-display text-4xl font-extrabold text-zinc-100 mt-1">
          Prestations de Montage & Motion Design
        </h1>
        <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
          Chaque projet bénéficie d'une attention sur-mesure, respectant vos impératifs de diffusion, vos chartes graphiques et vos délais.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onRequest={(id) => onSelectService(id)}
          />
        ))}
      </div>

      {/* Workflow Section */}
      <div className="rounded-2xl border border-zinc-800 bg-[#121417] p-8 sm:p-12 space-y-10">
        <div className="max-w-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 font-mono">
            Méthodologie
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-100 mt-1">
            Un processus fluide, transparent et réactif
          </h2>
          <p className="text-xs text-zinc-400 mt-2">
            Des étapes claires pour vous garantir un rendu final impeccable sans mauvaise surprise.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-zinc-850 bg-zinc-900/60 p-5 space-y-3"
            >
              <span className="font-mono text-xl font-bold text-amber-500">{item.step}</span>
              <h3 className="font-display font-semibold text-zinc-100 text-sm">{item.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Inclusions checklist */}
      <div className="rounded-2xl border border-zinc-800 bg-[#121417] p-8">
        <h3 className="font-display text-xl font-bold text-zinc-100 mb-6 text-center sm:text-left">
          Ce qui est systématiquement inclus dans chaque prestation :
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs text-zinc-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
            <span>2 tours de retouches complets inclus</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Musique libre de droits pour diffusion commerciale</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Export Master ProRes 422 & H.264 optimisé web</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Mixage audio et normalisation LUFS pour plateformes</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Déclinaisons adaptées aux formats verticaux (9:16)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Sauvegarde sécurisée de vos projets sur NAS redondant</span>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center max-w-xl mx-auto space-y-4">
        <h3 className="font-display text-2xl font-bold text-zinc-100">
          Vous avez un projet spécifique ?
        </h3>
        <p className="text-sm text-zinc-400">
          Transmettez-moi votre brief, vos délais et vos références. Je vous réponds avec un devis détaillé sous 24h.
        </p>
        <Button
          variant="accent"
          size="lg"
          onClick={() => onSelectService(services[0]?.id || '')}
          className="gap-2"
        >
          <span>Démarrer une demande de prestation</span>
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
