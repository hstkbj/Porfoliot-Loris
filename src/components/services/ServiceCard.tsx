import * as React from 'react';
import { Service } from '../../types';
import { Button } from '../ui/button';
import { Film, Sparkles, Smartphone, Building2, Video, Scissors, Layers, ArrowRight } from 'lucide-react';

interface ServiceCardProps {
  key?: React.Key;
  service: Service;
  onRequest: (serviceId: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Film,
  Sparkles,
  Smartphone,
  Building2,
  Video,
  Scissors,
  Layers,
};

export function ServiceCard({ service, onRequest }: ServiceCardProps) {
  const IconComponent = ICON_MAP[service.icon] || Film;

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-zinc-800 bg-[#121417] p-6 transition-all duration-300 hover:border-zinc-700 hover:bg-[#15171b]">
      <div>
        {/* Icon & Title */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
            <IconComponent className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
              {service.title}
            </h3>
            {service.indicative_duration && (
              <span className="text-xs text-zinc-500 font-mono">
                Délai : {service.indicative_duration}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-zinc-400 leading-relaxed mb-6">
          {service.description}
        </p>
      </div>

      {/* Footer info & CTA */}
      <div className="pt-4 border-t border-zinc-850 flex items-center justify-between gap-4">
        <div>
          {service.indicative_price && (
            <span className="text-xs font-semibold text-zinc-200 block">
              {service.indicative_price}
            </span>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onRequest(service.id)}
          className="text-xs group-hover:border-amber-500/50 group-hover:text-amber-300"
        >
          <span>Demander</span>
          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </div>
    </div>
  );
}
