import { useState } from 'react';
import { useProject, useProjects } from '../hooks/useData';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, ExternalLink, Calendar, User, Wrench, Play, Volume2, VolumeX, ArrowUpRight } from 'lucide-react';

interface ProjectDetailPageProps {
  slug: string;
  onBack: () => void;
  onNavigateProject: (slug: string) => void;
  onRequestQuote: (serviceId?: string) => void;
}

export function ProjectDetailPage({
  slug,
  onBack,
  onNavigateProject,
  onRequestQuote,
}: ProjectDetailPageProps) {
  const { data: project, isLoading } = useProject(slug);
  const { data: allProjects = [] } = useProjects();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        <div className="h-6 w-32 bg-zinc-800 rounded" />
        <div className="aspect-video w-full bg-zinc-800 rounded-xl" />
        <div className="h-8 w-1/2 bg-zinc-800 rounded" />
        <div className="h-20 w-full bg-zinc-800 rounded" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h2 className="font-display text-2xl font-bold text-zinc-100">Projet introuvable</h2>
        <p className="mt-2 text-sm text-zinc-400">Ce projet n'existe pas ou a été retiré.</p>
        <Button variant="outline" onClick={onBack} className="mt-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Retour aux réalisations</span>
        </Button>
      </div>
    );
  }

  // Related projects in same or other category
  const relatedProjects = allProjects
    .filter((p) => p.id !== project.id && p.published)
    .slice(0, 2);

  // Check if video URL is direct MP4 or embeddable
  const isDirectVideo =
    project.video_url.endsWith('.mp4') ||
    project.video_url.endsWith('.webm') ||
    project.video_url.includes('gtv-videos-bucket');

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer font-mono"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Toutes les réalisations</span>
        </button>
      </div>

      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="accent">{project.category}</Badge>
          <span className="font-mono text-xs text-zinc-400 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {project.year}
          </span>
          <span className="font-mono text-xs text-zinc-400 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {project.client}
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-100 leading-tight">
          {project.title}
        </h1>

        <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-3xl">
          {project.short_description}
        </p>
      </div>

      {/* Main Video / Showcase Media Player */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-black shadow-2xl aspect-video">
        {isDirectVideo ? (
          <div className="relative h-full w-full">
            <video
              src={project.video_url}
              poster={project.thumbnail_url}
              controls
              muted={isMuted}
              playsInline
              className="h-full w-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        ) : (
          /* Embed player (YouTube/Vimeo or web frame) */
          <div className="relative h-full w-full">
            {!isPlaying ? (
              <div className="relative h-full w-full cursor-pointer group" onClick={() => setIsPlaying(true)}>
                <img
                  src={project.thumbnail_url}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Play className="h-7 w-7 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            ) : (
              <iframe
                src={project.video_url}
                title={project.title}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        )}
      </div>

      {/* Detailed Project Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-4 border-t border-zinc-800">
        {/* Left 2 Cols: Story, Context, Challenges & Deliverables */}
        <div className="md:col-span-2 space-y-8">
          <div>
            <h3 className="font-display text-xl font-bold text-zinc-100 mb-3">
              Contexte & Vision du Projet
            </h3>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          </div>

          <div>
            <h3 className="font-display text-xl font-bold text-zinc-100 mb-3">
              Travail Réalisé & Post-Production
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-zinc-300">
              <div className="rounded-lg border border-zinc-800 bg-[#121417] p-4">
                <span className="font-semibold text-zinc-100 block mb-1">Montage & Narration</span>
                <span className="text-xs text-zinc-400">
                  Dérushage multi-caméra, sélection des meilleures prises, calage rythmique précis sur la bande son.
                </span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-[#121417] p-4">
                <span className="font-semibold text-zinc-100 block mb-1">Motion Design & Titrage</span>
                <span className="text-xs text-zinc-400">
                  Création des animations graphiques, lower-thirds, typographies cinétiques et animations vectorielles.
                </span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-[#121417] p-4">
                <span className="font-semibold text-zinc-100 block mb-1">Étalonnage Colorimétrique</span>
                <span className="text-xs text-zinc-400">
                  Color grading sur DaVinci Resolve, harmonisation des teintes de peau, contraste cinématique et lookbook personnalisé.
                </span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-[#121417] p-4">
                <span className="font-semibold text-zinc-100 block mb-1">Sound Design & Mixage</span>
                <span className="text-xs text-zinc-400">
                  Effets sonores (whooshes, risers, foley), spatialisation audio et mixage vocal conforme aux normes broadcast / web.
                </span>
              </div>
            </div>
          </div>

          {/* Extra Media Gallery if available */}
          {project.media && project.media.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="font-display text-xl font-bold text-zinc-100">
                Galerie & Rendu des Détails
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.media.map((med) => (
                  <div key={med.id} className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
                    <img
                      src={med.media_url}
                      alt={med.title || 'Détail projet'}
                      className="aspect-video w-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {med.title && (
                      <div className="p-2 text-xs text-zinc-400 bg-zinc-950 font-mono">
                        {med.title}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Meta info, tools, link, CTA */}
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-[#121417] p-6 space-y-5">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Client</span>
              <p className="text-sm font-semibold text-zinc-100 mt-0.5">{project.client}</p>
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Année de production</span>
              <p className="text-sm font-semibold text-zinc-100 mt-0.5">{project.year}</p>
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Catégorie</span>
              <p className="text-sm font-semibold text-zinc-100 mt-0.5">{project.category}</p>
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 block mb-2">
                Outils & Logiciels
              </span>
              <div className="flex flex-wrap gap-1.5">
                {project.tools.map((tool) => (
                  <span
                    key={tool}
                    className="rounded bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-300 border border-zinc-800"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {project.external_url && (
              <div className="pt-2">
                <a
                  href={project.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline"
                >
                  <span>Voir la diffusion externe</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Quick CTA box */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 text-center space-y-3">
            <h4 className="font-display font-bold text-zinc-100 text-base">
              Un projet similaire en tête ?
            </h4>
            <p className="text-xs text-zinc-400">
              Discutons de vos besoins pour créer une vidéo percutante adaptée à votre marque.
            </p>
            <Button
              variant="accent"
              className="w-full justify-center text-xs"
              onClick={() => onRequestQuote()}
            >
              <span>Demander un devis pour ce format</span>
              <ArrowUpRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <div className="pt-12 border-t border-zinc-800 space-y-6">
          <h3 className="font-display text-2xl font-bold text-zinc-100">
            Autres réalisations à découvrir
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedProjects.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onNavigateProject(rel.slug)}
                className="group flex gap-4 items-center rounded-xl border border-zinc-800 bg-[#121417] p-3 hover:border-zinc-700 cursor-pointer transition-colors"
              >
                <img
                  src={rel.thumbnail_url}
                  alt={rel.title}
                  className="h-20 w-28 rounded-lg object-cover bg-zinc-900 shrink-0"
                />
                <div className="overflow-hidden">
                  <Badge variant="accent" className="mb-1 text-[10px] px-2 py-0">
                    {rel.category}
                  </Badge>
                  <h4 className="font-display font-bold text-sm text-zinc-200 group-hover:text-amber-400 transition-colors line-clamp-1">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-1">{rel.client}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
