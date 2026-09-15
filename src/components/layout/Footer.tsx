import { useSiteSettings, useProfile, useSocialLinks } from '../../hooks/useData';
import { Play, ArrowUpRight, Shield } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { data: settings } = useSiteSettings();
  const { data: profile } = useProfile();
  const { data: socialLinks = [] } = useSocialLinks();

  return (
    <footer className="border-t border-zinc-800/80 bg-[#090a0b] text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-zinc-850">
          {/* Brand & bio */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-amber-500 text-zinc-950 font-bold">
                <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
              </div>
              <span className="font-display font-bold text-zinc-100 text-base uppercase">
                {settings?.site_name || profile?.professional_name || 'Studio'}
              </span>
            </div>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
              {profile?.short_bio || settings?.site_description}
            </p>
            <div className="text-xs text-zinc-500">
              {settings?.location || profile?.location}
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('/projets')}
                  className="hover:text-zinc-100 transition-colors"
                >
                  Réalisations
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/services')}
                  className="hover:text-zinc-100 transition-colors"
                >
                  Services & Tarifs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/a-propos')}
                  className="hover:text-zinc-100 transition-colors"
                >
                  À propos du monteur
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/demande')}
                  className="hover:text-zinc-100 transition-colors"
                >
                  Demander un devis
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="hover:text-zinc-100 transition-colors"
                >
                  Contact direct
                </button>
              </li>
            </ul>
          </div>

          {/* Social Links from DB */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
              Réseaux & Plateformes
            </h4>
            <div className="flex flex-col space-y-2 text-sm">
              {socialLinks.length === 0 ? (
                <span className="text-xs text-zinc-500">Aucun réseau configuré</span>
              ) : (
                socialLinks.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-amber-400 transition-colors"
                  >
                    <span>{item.platform}</span>
                    <ArrowUpRight className="h-3 w-3 text-zinc-500" />
                  </a>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bottom copyright & admin quick link */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>{settings?.copyright_text || '© Tous droits réservés.'}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/admin')}
              className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors"
            >
              <Shield className="h-3.5 w-3.5 text-zinc-500" />
              <span>Administration /admin</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
