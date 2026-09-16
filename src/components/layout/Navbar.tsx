import { useState } from 'react';
import { useSiteSettings, useProfile } from '../../hooks/useData';
import { Button } from '../ui/button';
import { Menu, X, Play, ArrowUpRight, Shield } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function Navbar({ currentPath, onNavigate }: NavbarProps) {
  const { data: settings } = useSiteSettings();
  const { data: profile } = useProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Accueil', path: '/' },
    { label: 'Réalisations', path: '/projets' },
    { label: 'Services', path: '/services' },
    { label: 'À propos', path: '/a-propos' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#0c0d0e]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <button
          onClick={() => handleNav('/')}
          className="flex items-center gap-2.5 text-left group transition-transform focus:outline-none"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-500 text-zinc-950 font-bold group-hover:scale-105 transition-transform">
            <Play className="h-4 w-4 fill-current ml-0.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-sm font-bold tracking-tight text-zinc-100 uppercase">
              {settings?.site_name || profile?.professional_name || 'Studio'}
            </span>
            <span className="text-[10px] tracking-wider text-zinc-400 uppercase font-mono">
              {profile?.job_title || 'Monteur Vidéo & Motion'}
            </span>
          </div>
        </button>

        {/* Availability Badge Desktop */}
        {profile?.availability !== undefined && (
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-400">
            <span
              className={`h-2 w-2 rounded-full ${
                profile.availability ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
              }`}
            />
            <span>
              {profile.availability ? 'Disponible pour nouveaux projets' : 'Planning complet ce mois'}
            </span>
          </div>
        )}

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`relative px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer rounded-md ${
                  isActive ? 'text-zinc-100 font-semibold' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-amber-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <Button
            variant="accent"
            size="sm"
            onClick={() => handleNav('/demande')}
            className="flex items-center gap-1.5"
          >
            <span>Demander un service</span>
            <ArrowUpRight className="h-4 w-4" />
          </Button>

          <button
            onClick={() => handleNav('/admin')}
            title="Espace administration"
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 rounded-md transition-colors"
          >
            <Shield className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6 text-zinc-200" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-[#0c0d0e] px-4 py-5 animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-3">
            {profile?.availability !== undefined && (
              <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-300">
                <span
                  className={`h-2 w-2 rounded-full ${
                    profile.availability ? 'bg-emerald-400' : 'bg-zinc-500'
                  }`}
                />
                <span>
                  {profile.availability ? 'Disponible pour missions' : 'Planning complet'}
                </span>
              </div>
            )}

            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPath === item.path
                    ? 'bg-zinc-800/80 text-amber-400 font-semibold'
                    : 'text-zinc-300 hover:bg-zinc-800/40'
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="accent"
                className="w-full justify-center"
                onClick={() => handleNav('/demande')}
              >
                Demander un service
              </Button>
              <Button
                variant="outline"
                className="w-full justify-center text-xs"
                onClick={() => handleNav('/admin')}
              >
                <Shield className="h-3.5 w-3.5 mr-1.5" />
                Accès Espace Admin
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
