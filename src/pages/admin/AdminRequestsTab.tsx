import { useState, useMemo } from 'react';
import {
  useServiceRequests,
  useUpdateServiceRequestStatus,
  useDeleteServiceRequest,
  useServices,
} from '../../hooks/useData';
import { ServiceRequest, RequestStatus } from '../../types';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { useToast } from '../../components/ui/toast';
import { formatDate } from '../../lib/utils';
import {
  Mail,
  Phone,
  Building,
  Calendar,
  DollarSign,
  ExternalLink,
  FileText,
  Trash2,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; variant: 'warning' | 'default' | 'success' | 'outline' }> = {
  en_attente: { label: 'En attente', variant: 'warning' },
  en_cours: { label: 'En cours d’étude', variant: 'default' },
  acceptee: { label: 'Acceptée', variant: 'success' },
  refusee: { label: 'Refusée', variant: 'outline' },
  terminee: { label: 'Terminée / Livrée', variant: 'default' },
  Nouvelle: { label: 'En attente', variant: 'warning' },
  'En cours': { label: 'En cours', variant: 'default' },
  Contacté: { label: 'Contacté', variant: 'default' },
  Terminée: { label: 'Terminée', variant: 'success' },
  Refusée: { label: 'Refusée', variant: 'outline' },
};

export function AdminRequestsTab() {
  const { data: requests = [] } = useServiceRequests();
  const { data: services = [] } = useServices(false);
  const updateStatusMutation = useUpdateServiceRequestStatus();
  const deleteRequestMutation = useDeleteServiceRequest();
  const { toast } = useToast();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredRequests = useMemo(() => {
    if (filterStatus === 'all') return requests;
    return requests.filter((r) => r.status === filterStatus);
  }, [requests, filterStatus]);

  const handleStatusChange = async (requestId: string, newStatus: RequestStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: requestId, status: newStatus });
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
      toast({
        title: 'Statut mis à jour',
        message: `La demande est désormais "${STATUS_LABELS[newStatus].label}".`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Erreur',
        message: err?.message || 'Échec de la mise à jour.',
        type: 'error',
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteRequestMutation.mutateAsync(deletingId);
      if (selectedRequest?.id === deletingId) setSelectedRequest(null);
      toast({
        title: 'Demande supprimée',
        message: 'La demande a été retirée des archives.',
        type: 'info',
      });
      setDeletingId(null);
    } catch (err: any) {
      toast({
        title: 'Erreur',
        message: err?.message || 'Échec de la suppression.',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-zinc-100">
            Demandes de prestations & devis
          </h2>
          <p className="text-xs text-zinc-400">
            Suivez et traitez les demandes de devis reçues depuis le formulaire du site.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-amber-500 text-zinc-950 font-semibold'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            Toutes ({requests.length})
          </button>
          <button
            onClick={() => setFilterStatus('en_attente')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer ${
              filterStatus === 'en_attente'
                ? 'bg-amber-500 text-zinc-950 font-semibold'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            En attente ({requests.filter((r) => r.status === 'en_attente').length})
          </button>
          <button
            onClick={() => setFilterStatus('acceptee')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer ${
              filterStatus === 'acceptee'
                ? 'bg-amber-500 text-zinc-950 font-semibold'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            Acceptées ({requests.filter((r) => r.status === 'acceptee').length})
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="rounded-xl border border-zinc-800 bg-[#121417] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-zinc-800 bg-zinc-900/80 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-4 py-3">Client / Prospect</th>
                <th className="px-4 py-3">Service demandé</th>
                <th className="px-4 py-3">Budget / Délai</th>
                <th className="px-4 py-3">Date réception</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    Aucune demande dans cette catégorie.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const serviceObj = services.find((s) => s.id === req.service_id);
                  const statusInfo = STATUS_LABELS[req.status] || {
                    label: req.status,
                    variant: 'default',
                  };

                  return (
                    <tr
                      key={req.id}
                      onClick={() => setSelectedRequest(req)}
                      className="hover:bg-zinc-900/40 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-zinc-100">{req.full_name}</div>
                        <div className="text-[11px] text-zinc-400">{req.email}</div>
                        {req.company && (
                          <div className="text-[10px] text-zinc-500 font-mono">{req.company}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-zinc-200">
                          {serviceObj?.title || 'Prestation personnalisée'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-zinc-400">
                        <div>{req.budget || 'Non spécifié'}</div>
                        <div className="text-[10px] text-zinc-500">{req.desired_date || ''}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-zinc-500">
                        {formatDate(req.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequest(req);
                          }}
                          className="text-[11px] h-7"
                        >
                          Consulter
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <Dialog open={Boolean(selectedRequest)} onOpenChange={(open) => !open && setSelectedRequest(null)}>
          <DialogContent onClose={() => setSelectedRequest(null)} className="max-w-2xl space-y-6">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Détail de la demande de devis</DialogTitle>
                <Badge variant={STATUS_LABELS[selectedRequest.status]?.variant || 'default'}>
                  {STATUS_LABELS[selectedRequest.status]?.label || selectedRequest.status}
                </Badge>
              </div>
            </DialogHeader>

            {/* Status change actions */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2">
              <span className="text-xs font-semibold uppercase font-mono text-zinc-400">
                Mettre à jour le statut
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {(['en_attente', 'en_cours', 'acceptee', 'refusee', 'terminee'] as RequestStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedRequest.id, st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                        selectedRequest.status === st
                          ? 'bg-amber-500 text-zinc-950 font-bold'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {STATUS_LABELS[st].label}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-zinc-500 font-mono">Nom complet</span>
                <p className="font-semibold text-zinc-100 text-sm">{selectedRequest.full_name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500 font-mono">Entreprise / Agence</span>
                <p className="font-semibold text-zinc-100 text-sm">
                  {selectedRequest.company || 'Particulier / Non renseigné'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500 font-mono">Email</span>
                <a
                  href={`mailto:${selectedRequest.email}`}
                  className="font-semibold text-amber-400 hover:underline block text-sm"
                >
                  {selectedRequest.email}
                </a>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500 font-mono">Téléphone</span>
                <a
                  href={`tel:${selectedRequest.phone}`}
                  className="font-semibold text-zinc-200 hover:underline block text-sm"
                >
                  {selectedRequest.phone}
                </a>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500 font-mono">Budget indicatif</span>
                <p className="font-semibold text-zinc-200">{selectedRequest.budget || 'Non précisé'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500 font-mono">Délai souhaité</span>
                <p className="font-semibold text-zinc-200">{selectedRequest.desired_date || 'Flexible'}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase font-mono text-zinc-400">
                Description du projet
              </span>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-4 text-xs text-zinc-300 whitespace-pre-line leading-relaxed">
                {selectedRequest.description}
              </div>
            </div>

            {/* External reference or files */}
            {(selectedRequest.reference_url || selectedRequest.attachment_url) && (
              <div className="space-y-2 pt-2 border-t border-zinc-850">
                <span className="text-xs font-semibold uppercase font-mono text-zinc-400">
                  Éléments & Fichiers fournis
                </span>
                <div className="flex flex-col gap-2">
                  {selectedRequest.reference_url && (
                    <a
                      href={selectedRequest.reference_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Ouvrir les références transmises ({selectedRequest.reference_url})</span>
                    </a>
                  )}
                  {selectedRequest.attachment_url && (
                    <a
                      href={selectedRequest.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Consulter la pièce jointe ou document de brief</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeletingId(selectedRequest.id)}
                className="gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Supprimer la demande</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedRequest(null)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete dialog */}
      <ConfirmDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Supprimer la demande de devis"
        description="Cette demande sera définitivement effacée."
        onConfirm={handleDelete}
      />
    </div>
  );
}
