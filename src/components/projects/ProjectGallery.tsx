import { useState, useMemo } from 'react';
import { Project, ProjectCategory } from '../../types';
import { ProjectCard } from './ProjectCard';
import { Search, Filter, Sparkles } from 'lucide-react';
import { Input } from '../ui/input';

interface ProjectGalleryProps {
  projects: Project[];
  onSelectProject: (slug: string) => void;
  showFilters?: boolean;
  limit?: number;
}

const CATEGORIES: ('Tous' | ProjectCategory)[] = [
  'Tous',
  'Montage vidéo',
  'Motion Design',
  'Publicité',
  'Réseaux sociaux',
  'Clip musical',
  'Vidéo corporate',
  'YouTube',
  'Animation',
];

export function ProjectGallery({
  projects,
  onSelectProject,
  showFilters = true,
  limit,
}: ProjectGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = useMemo(() => {
    let result = projects;

    if (selectedCategory !== 'Tous') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.short_description.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q) ||
          p.tools.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (limit) {
      return result.slice(0, limit);
    }

    return result;
  }, [projects, selectedCategory, searchQuery, limit]);

  return (
    <div className="space-y-8">
      {showFilters && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2">
          {/* Categories bar */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search field */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              type="text"
              placeholder="Rechercher un projet, client, outil..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9 bg-zinc-900 border-zinc-800"
            />
          </div>
        </div>
      )}

      {/* Grid of Projects */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={onSelectProject}
              featured={!limit && selectedCategory === 'Tous' && !searchQuery && idx === 0}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800/80 bg-[#121417] p-12 text-center">
          <div className="rounded-full bg-zinc-900 p-4 text-zinc-500 mb-4 border border-zinc-800">
            <Filter className="h-6 w-6" />
          </div>
          <h4 className="font-display text-base font-semibold text-zinc-200">
            Aucune réalisation trouvée
          </h4>
          <p className="mt-1 text-sm text-zinc-500 max-w-sm">
            {searchQuery || selectedCategory !== 'Tous'
              ? 'Aucun projet ne correspond à vos filtres actuels. Essayez de réinitialiser la recherche.'
              : 'Les réalisations seront bientôt disponibles.'}
          </p>
          {(searchQuery || selectedCategory !== 'Tous') && (
            <button
              onClick={() => {
                setSelectedCategory('Tous');
                setSearchQuery('');
              }}
              className="mt-4 text-xs font-semibold text-amber-400 hover:underline cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
}
