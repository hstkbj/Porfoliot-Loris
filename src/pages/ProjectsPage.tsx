import { useProjects } from '../hooks/useData';
import { ProjectGallery } from '../components/projects/ProjectGallery';
import { Skeleton } from '../components/ui/skeleton';

interface ProjectsPageProps {
  onSelectProject: (slug: string) => void;
}

export function ProjectsPage({ onSelectProject }: ProjectsPageProps) {
  const { data: projects, isLoading } = useProjects();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="max-w-2xl">
        <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase font-mono">
          Portfolio Audiovisuel
        </span>
        <h1 className="font-display text-4xl font-extrabold text-zinc-100 mt-1">
          Réalisations & Projets
        </h1>
        <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
          Découvrez une sélection de spots publicitaires, animations motion design, clips musicaux et contenus digitaux réalisés pour des marques, artistes et créateurs.
        </p>
      </div>

      {/* Loading state or Gallery */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl border border-zinc-800 bg-[#121417] p-4 space-y-4">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <ProjectGallery
          projects={projects || []}
          onSelectProject={onSelectProject}
          showFilters={true}
        />
      )}
    </div>
  );
}
