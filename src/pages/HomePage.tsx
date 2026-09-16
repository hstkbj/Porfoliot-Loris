import { useProfile, useSiteSettings, useProjects, useServices, useSkills } from '../hooks/useData';
import { ProjectGallery } from '../components/projects/ProjectGallery';
import { ServiceCard } from '../components/services/ServiceCard';
import { Button } from '../components/ui/button';
import { ArrowUpRight, Play, CheckCircle2, ChevronRight, Award, Film, Layers } from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string, params?: Record<string, string>) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { data: profile } = useProfile();
  const { data: settings } = useSiteSettings();
  const { data: projects = [] } = useProjects();
  const { data: services = [] } = useServices();
  const { data: skills = [] } = useSkills();

  const handleRequestService = (serviceId: string) => {
    onNavigate('/demande', { serviceId });
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 lg:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Availability tag */}
              {profile?.availability && (
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Disponible pour nouveaux projets & missions freelance</span>
                </div>
              )}

              {/* Eyebrow / Profession */}
              <h2 className="text-xs md:text-sm font-semibold tracking-widest text-amber-400 uppercase font-mono">
                {profile?.hero_title || profile?.job_title || 'MONTEUR VIDÉO & MOTION DESIGNER'}
              </h2>

              {/* Main Headline */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-100 leading-[1.1]">
                {profile?.short_bio ? (
                  profile.short_bio
                ) : (
                  <>
                    Je façonne vos idées en{' '}
                    <span className="text-zinc-400">récits visuels</span> qui captent l’attention.
                  </>
                )}
              </h1>

              {/* Hero description */}
              <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
                {profile?.hero_description ||
                  profile?.bio ||
                  settings?.site_description ||
                  'Du spot publicitaire percutant à l’habillage motion design complet. Rythme chirurgical, colorimétrie maîtrisée et sound design immersif.'}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  variant="accent"
                  size="lg"
                  onClick={() => onNavigate('/demande')}
                  className="gap-2"
                >
                  <span>Demander un devis</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onNavigate('/projets')}
                  className="gap-2"
                >
                  <span>Voir mes réalisations</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Trust markers */}
              <div className="pt-6 border-t border-zinc-850 flex flex-wrap items-center gap-6 text-xs text-zinc-400 font-mono">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-400" />
                  <span>{profile?.years_experience || 7}+ ans d'expérience</span>
                </div>
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-amber-400" />
                  <span>{projects.length}+ projets livrés</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-amber-400" />
                  <span>4K, Vertical 9:16 & 3D</span>
                </div>
              </div>
            </div>

            {/* Right Audiovisual Reel Preview */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl border border-zinc-800 bg-[#121417] p-2 shadow-2xl overflow-hidden group">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900">
                  <img
                    src={projects[0]?.thumbnail_url || profile?.photo_url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'}
                    alt="Showreel preview"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Play trigger button */}
                  <div
                    onClick={() => {
                      if (projects[0]) onNavigate(`/projets/${projects[0].slug}`);
                      else onNavigate('/projets');
                    }}
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500 text-zinc-950 shadow-2xl transition-transform hover:scale-110">
                      <Play className="h-7 w-7 fill-current ml-0.5" />
                    </div>
                    <span className="mt-3 text-xs font-semibold uppercase tracking-widest text-zinc-200 font-mono">
                      Lancer le projet à la une
                    </span>
                  </div>

                  {/* Bottom overlay badge */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-zinc-300">
                    <span className="font-semibold text-zinc-100 line-clamp-1">
                      {projects[0]?.title || 'Showreel & Projets Réalisés'}
                    </span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-black/60 border border-zinc-700">
                      {projects[0]?.category || 'Sélection'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED PROJECTS SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xs font-semibold tracking-wider text-amber-400 uppercase font-mono">
              Portfolio & Réalisations
            </h2>
            <h3 className="font-display text-3xl font-bold text-zinc-100 mt-1">
              Travaux récents sélectionnés
            </h3>
          </div>
          <Button
            variant="ghost"
            onClick={() => onNavigate('/projets')}
            className="self-start sm:self-auto gap-1 text-xs text-zinc-300 hover:text-zinc-100"
          >
            <span>Explorer tous les projets</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <ProjectGallery
          projects={projects}
          onSelectProject={(slug) => onNavigate(`/projets/${slug}`)}
          showFilters={false}
          limit={4}
        />
      </section>

      {/* 3. SERVICES SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h2 className="text-xs font-semibold tracking-wider text-amber-400 uppercase font-mono">
            Prestations & Savoir-faire
          </h2>
          <h3 className="font-display text-3xl font-bold text-zinc-100 mt-1">
            Des services sur-mesure pour votre image
          </h3>
          <p className="mt-2 text-sm text-zinc-400">
            Du découpage brut jusqu’au master final 4K, chaque étape est travaillée avec soin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onRequest={handleRequestService}
            />
          ))}
        </div>
      </section>

      {/* 4. SOFTWARE / SKILLS BAR */}
      {skills.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-zinc-800 bg-[#121417] p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 font-mono">
                  Stack Technique
                </span>
                <h4 className="font-display text-2xl font-bold text-zinc-100 mt-1">
                  Maîtrise des standards de l’industrie
                </h4>
                <p className="mt-2 text-xs text-zinc-400">
                  Des logiciels professionnels optimisés pour le travail en équipe, la colorimétrie et le rendu 3D.
                </p>
              </div>

              <div className="md:col-span-2 flex flex-wrap gap-2.5">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/90 px-3.5 py-2 text-xs text-zinc-200"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">({skill.category})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. CALL TO ACTION BANNER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#15171b] px-6 py-14 sm:px-12 sm:py-16 text-center">
          <div className="mx-auto max-w-2xl space-y-4">
            <h2 className="text-xs font-semibold tracking-widest text-amber-400 uppercase font-mono">
              Démarrer un projet
            </h2>
            <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-zinc-100">
              Prêt à donner vie à votre prochaine vidéo ?
            </h3>
            <p className="text-sm sm:text-base text-zinc-400">
              Parlons de vos objectifs, de votre calendrier et de la direction artistique souhaitée. Réponse sous 24h ouvrées.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button
                variant="accent"
                size="lg"
                onClick={() => onNavigate('/demande')}
                className="gap-2"
              >
                <span>Demander un devis gratuit</span>
                <ArrowUpRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate('/contact')}
              >
                Poser une question
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
