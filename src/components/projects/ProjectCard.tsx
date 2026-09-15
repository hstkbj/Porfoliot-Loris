import * as React from 'react';
import { Project } from '../../types';
import { Badge } from '../ui/badge';
import { Play, ArrowUpRight } from 'lucide-react';

interface ProjectCardProps {
  key?: React.Key;
  project: Project;
  onSelect: (slug: string) => void;
  featured?: boolean;
}

export function ProjectCard({ project, onSelect, featured }: ProjectCardProps) {
  return (
    <div
      onClick={() => onSelect(project.slug)}
      className={`group relative flex flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-[#121417] transition-all duration-300 hover:border-zinc-600/80 hover:-translate-y-1 cursor-pointer ${
        featured ? 'md:col-span-2' : ''
      }`}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
        <img
          src={project.thumbnail_url}
          alt={project.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />

        {/* Subtle Dark Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Play Icon Overlay on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/90 text-zinc-950 shadow-xl backdrop-blur-sm transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="h-6 w-6 fill-current ml-0.5" />
          </div>
        </div>

        {/* Category & Year Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <Badge variant="accent" className="bg-black/60 backdrop-blur-md border-zinc-700/80 text-amber-300">
            {project.category}
          </Badge>
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-zinc-300 border border-zinc-700/50">
            {project.year}
          </span>
        </div>

        {/* Client Bottom Info */}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-xs uppercase tracking-wider text-zinc-300 font-mono">
            {project.client}
          </p>
        </div>
      </div>

      {/* Content Details */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg font-bold text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-1">
              {project.title}
            </h3>
            <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
          </div>
          <p className="mt-2 text-sm text-zinc-400 line-clamp-2 leading-relaxed">
            {project.short_description}
          </p>
        </div>

        {/* Tools badges */}
        {project.tools && project.tools.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-zinc-800/80">
            {project.tools.slice(0, 4).map((tool) => (
              <span
                key={tool}
                className="rounded bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-zinc-400 border border-zinc-800"
              >
                {tool}
              </span>
            ))}
            {project.tools.length > 4 && (
              <span className="text-[10px] text-zinc-500 self-center">
                +{project.tools.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
