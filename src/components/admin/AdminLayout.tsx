import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSiteSettings, useServiceRequests, useContactMessages } from '../../hooks/useData';
import {
  LayoutDashboard,
  Film,
  Briefcase,
  Inbox,
  MessageSquare,
  User,
  FileText,
  Wrench,
  Share2,
  Settings,
  LogOut,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'projects'
  | 'services'
  | 'requests'
  | 'messages'
  | 'profile'
  | 'resume'
  | 'skills'
  | 'socials'
  | 'settings';

interface AdminLayoutProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onExitAdmin: () => void;
  children: React.ReactNode;
}

export function AdminLayout({ activeTab, onTabChange, onExitAdmin, children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const { data: settings } = useSiteSettings();
  const { data: requests = [] } = useServiceRequests();
  const { data: messages = [] } = useContactMessages();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  const pendingRequestsCount = requests.filter((r) => r.status === 'en_attente').length;
  const unreadMessagesCount = messages.filter((m) => !m.read).length;

  const navLinks: { id: AdminTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'projects', label: 'Réalisations', icon: Film },
    { id: 'services', label: 'Services & Tarifs', icon: Briefcase },
    {
      id: 'requests',
      label: 'Demandes de devis',
      icon: Inbox,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
    },
    {
      id: 'messages',
      label: 'Messages de contact',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    { id: 'profile', label: 'Profil & Bio', icon: User },
    { id: 'resume', label: 'Gestion du CV', icon: FileText },
    { id: 'skills', label: 'Compétences & Outils', icon: Wrench },
    { id: 'socials', label: 'Réseaux Sociaux', icon: Share2 },
    { id: 'settings', label: 'Paramètres du site', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#090a0c] text-zinc-100">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-zinc-850 bg-[#0e1013] p-4 shrink-0">
        <div className="space-y-6">
          {/* Logo & title */}
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-amber-500 text-zinc-950 font-bold">
                <span className="font-mono text-xs font-black">AD</span>
              </div>
              <div className="overflow-hidden">
                <h2 className="font-display text-sm font-bold text-zinc-100 uppercase tracking-tight truncate">
                  {settings?.site_name || 'Studio Admin'}
                </h2>
                <span className="text-[10px] text-amber-400 font-mono block">Espace sécurisé</span>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onTabChange(link.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge !== undefined && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] font-bold ${
                        isActive ? 'bg-zinc-950 text-amber-400' : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="space-y-2 border-t border-zinc-850 pt-4">
          <button
            onClick={onExitAdmin}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Voir le site public</span>
            </span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-850 bg-[#0e1013]/90 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-base font-bold text-zinc-100 capitalize">
              {navLinks.find((l) => l.id === activeTab)?.label || 'Administration'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onExitAdmin}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Site public</span>
            </button>

            <div className="flex items-center gap-2 border-l border-zinc-800 pl-4">
              <div className="h-7 w-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono text-xs text-amber-400 font-bold">
                {user?.email ? user.email[0].toUpperCase() : 'A'}
              </div>
              <span className="hidden sm:inline text-xs text-zinc-300 font-medium">
                {user?.email || 'admin@studio.com'}
              </span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#090a0c]">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/70" onClick={() => setMobileNavOpen(false)} />
          <div className="relative flex w-64 flex-col justify-between bg-[#0e1013] p-4 border-r border-zinc-800">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="font-display text-sm font-bold text-zinc-100">Menu Admin</span>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded p-1 text-zinc-400 hover:bg-zinc-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = activeTab === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => {
                        onTabChange(link.id);
                        setMobileNavOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium ${
                        isActive
                          ? 'bg-amber-500 text-zinc-950 font-semibold'
                          : 'text-zinc-400 hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4" />
                        <span>{link.label}</span>
                      </div>
                      {link.badge !== undefined && (
                        <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 font-mono text-[10px] text-amber-300">
                          {link.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-2 border-t border-zinc-800 pt-4">
              <button
                onClick={() => {
                  onExitAdmin();
                  setMobileNavOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-800"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Site public</span>
              </button>
              <button
                onClick={() => logout()}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
