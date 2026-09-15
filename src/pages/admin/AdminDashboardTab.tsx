import { useProjects, useServices, useServiceRequests, useContactMessages, useResume } from '../../hooks/useData';
import { Film, Briefcase, Inbox, MessageSquare, FileText, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { formatDate } from '../../lib/utils';
import { AdminTab } from '../../components/admin/AdminLayout';

interface AdminDashboardTabProps {
  onNavigateTab: (tab: AdminTab) => void;
}

export function AdminDashboardTab({ onNavigateTab }: AdminDashboardTabProps) {
  const { data: projects = [] } = useProjects(false); // get all including unpublished
  const { data: services = [] } = useServices(false);
  const { data: requests = [] } = useServiceRequests();
  const { data: messages = [] } = useContactMessages();
  const { data: resume } = useResume();

  const publishedProjects = projects.filter((p) => p.published).length;
  const pendingRequests = requests.filter((r) => r.status === 'en_attente').length;
  const unreadMessages = messages.filter((m) => !m.read).length;

  const stats = [
    {
      title: 'Projets au portfolio',
      value: projects.length,
      sub: `${publishedProjects} publiés en ligne`,
      icon: Film,
      actionTab: 'projects' as AdminTab,
    },
    {
      title: 'Demandes de devis',
      value: requests.length,
      sub: `${pendingRequests} en attente de traitement`,
      icon: Inbox,
      highlight: pendingRequests > 0,
      actionTab: 'requests' as AdminTab,
    },
    {
      title: 'Messages de contact',
      value: messages.length,
      sub: `${unreadMessages} non lu(s)`,
      icon: MessageSquare,
      highlight: unreadMessages > 0,
      actionTab: 'messages' as AdminTab,
    },
    {
      title: 'Services actifs',
      value: services.filter((s) => s.active).length,
      sub: `${services.length} prestations créées`,
      icon: Briefcase,
      actionTab: 'services' as AdminTab,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h2 className="font-display text-2xl font-bold text-zinc-100">
          Vue d'ensemble du studio
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Surveillez vos demandes entrantes, vos réalisations et les messages de vos prospects.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(s.actionTab)}
              className={`rounded-xl border p-5 cursor-pointer transition-all hover:border-zinc-600 ${
                s.highlight
                  ? 'border-amber-500/40 bg-amber-500/5'
                  : 'border-zinc-800 bg-[#121417]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">{s.title}</span>
                <div
                  className={`rounded-lg p-2 ${
                    s.highlight ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-850 text-zinc-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="font-display text-3xl font-bold text-zinc-100">{s.value}</span>
                <p className="text-xs text-zinc-400 mt-1">{s.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CV Status banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-[#121417] p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-amber-400">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-zinc-200">
              Statut du CV téléchargeable
            </h4>
            <p className="text-xs text-zinc-400">
              {resume?.file_url
                ? `Fichier en ligne : ${resume.file_name} (${resume.file_size || 'PDF'})`
                : 'Aucun CV actuellement en ligne. Pensez à en téléverser un.'}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigateTab('resume')}
          className="text-xs"
        >
          Gérer le CV
        </Button>
      </div>

      {/* 2 columns: Recent Requests & Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Service Requests */}
        <div className="rounded-xl border border-zinc-800 bg-[#121417] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-zinc-100 flex items-center gap-2">
              <Inbox className="h-4 w-4 text-amber-400" />
              <span>Dernières demandes de devis</span>
            </h3>
            <button
              onClick={() => onNavigateTab('requests')}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-mono"
            >
              <span>Voir tout ({requests.length})</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {requests.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">Aucune demande reçue pour le moment.</p>
            ) : (
              requests.slice(0, 4).map((req) => (
                <div
                  key={req.id}
                  onClick={() => onNavigateTab('requests')}
                  className="flex items-start justify-between gap-3 rounded-lg border border-zinc-850 bg-zinc-900/60 p-3.5 hover:border-zinc-700 cursor-pointer transition-colors"
                >
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-zinc-200 truncate">
                        {req.full_name}
                      </span>
                      {req.company && (
                        <span className="text-[10px] text-zinc-400 font-mono">({req.company})</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-1">{req.description}</p>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {formatDate(req.created_at)}
                    </span>
                  </div>

                  <Badge
                    variant={
                      req.status === 'en_attente'
                        ? 'warning'
                        : req.status === 'acceptee'
                        ? 'success'
                        : 'default'
                    }
                  >
                    {req.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="rounded-xl border border-zinc-800 bg-[#121417] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-zinc-100 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-amber-400" />
              <span>Derniers messages de contact</span>
            </h3>
            <button
              onClick={() => onNavigateTab('messages')}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-mono"
            >
              <span>Voir tout ({messages.length})</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {messages.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">Aucun message de contact reçu.</p>
            ) : (
              messages.slice(0, 4).map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => onNavigateTab('messages')}
                  className="flex items-start justify-between gap-3 rounded-lg border border-zinc-850 bg-zinc-900/60 p-3.5 hover:border-zinc-700 cursor-pointer transition-colors"
                >
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-zinc-200">{msg.name}</span>
                      {!msg.read && (
                        <span className="h-2 w-2 rounded-full bg-amber-400" title="Non lu" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-1">{msg.message}</p>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-zinc-500 shrink-0">
                    {msg.read ? 'Lu' : 'Non lu'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
