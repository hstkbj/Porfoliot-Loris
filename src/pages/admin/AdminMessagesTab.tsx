import { useState } from 'react';
import {
  useContactMessages,
  useMarkMessageRead,
  useDeleteContactMessage,
} from '../../hooks/useData';
import { ContactMessage } from '../../types';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { useToast } from '../../components/ui/toast';
import { formatDate } from '../../lib/utils';
import { Mail, Trash2, CheckCircle2, MessageSquare } from 'lucide-react';

export function AdminMessagesTab() {
  const { data: messages = [] } = useContactMessages();
  const markReadMutation = useMarkMessageRead();
  const deleteMessageMutation = useDeleteContactMessage();
  const { toast } = useToast();

  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      await markReadMutation.mutateAsync({ id: msg.id, read: true });
    }
  };

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    try {
      await markReadMutation.mutateAsync({ id, read: !currentRead });
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({ ...selectedMessage, read: !currentRead });
      }
    } catch (err: any) {
      toast({ title: 'Erreur', message: err?.message, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteMessageMutation.mutateAsync(deletingId);
      if (selectedMessage?.id === deletingId) setSelectedMessage(null);
      toast({
        title: 'Message supprimé',
        message: 'Le message a été supprimé.',
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
            Messages de contact direct
          </h2>
          <p className="text-xs text-zinc-400">
            {messages.filter((m) => !m.read).length} message(s) non lu(s) sur {messages.length}.
          </p>
        </div>
      </div>

      {/* Messages List */}
      <div className="rounded-xl border border-zinc-800 bg-[#121417] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-zinc-800 bg-zinc-900/80 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-4 py-3">Expéditeur</th>
                <th className="px-4 py-3">Sujet / Message</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    Aucun message reçu pour le moment.
                  </td>
                </tr>
              ) : (
                messages.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => handleOpenMessage(m)}
                    className={`hover:bg-zinc-900/40 transition-colors cursor-pointer ${
                      !m.read ? 'bg-amber-500/[0.03]' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-zinc-100 flex items-center gap-2">
                        {!m.read && <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />}
                        <span>{m.name}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400">{m.email}</div>
                    </td>
                    <td className="px-4 py-3 max-w-md">
                      <div className="font-medium text-zinc-200 truncate">
                        {m.subject || 'Sans objet'}
                      </div>
                      <div className="text-[11px] text-zinc-400 line-clamp-1">{m.message}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-500">
                      {formatDate(m.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={m.read ? 'default' : 'warning'}>
                        {m.read ? 'Lu' : 'Non lu'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleRead(m.id, m.read)}
                        className="text-[11px] h-7 px-2"
                      >
                        {m.read ? 'Marquer non lu' : 'Marquer lu'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingId(m.id)}
                        className="h-7 w-7 text-zinc-400 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Reader Modal */}
      {selectedMessage && (
        <Dialog open={Boolean(selectedMessage)} onOpenChange={(open) => !open && setSelectedMessage(null)}>
          <DialogContent onClose={() => setSelectedMessage(null)} className="max-w-lg space-y-4">
            <DialogHeader>
              <DialogTitle>{selectedMessage.subject || 'Message de contact'}</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-xs border-y border-zinc-800 py-3">
              <div className="flex justify-between">
                <span className="text-zinc-500 font-mono">De :</span>
                <span className="font-medium text-zinc-200">
                  {selectedMessage.name} &lt;{selectedMessage.email}&gt;
                </span>
              </div>
              {selectedMessage.phone && (
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-mono">Téléphone :</span>
                  <a href={`tel:${selectedMessage.phone}`} className="text-amber-400 hover:underline">
                    {selectedMessage.phone}
                  </a>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-500 font-mono">Date :</span>
                <span className="font-mono text-zinc-400">
                  {formatDate(selectedMessage.created_at)}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-zinc-900/80 p-4 text-xs text-zinc-300 whitespace-pre-line leading-relaxed min-h-[100px]">
              {selectedMessage.message}
            </div>

            <DialogFooter>
              <Button
                variant="accent"
                size="sm"
                onClick={() => {
                  window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                    selectedMessage.subject || 'Votre message'
                  )}`;
                }}
                className="gap-1.5"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Répondre par email</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedMessage(null)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <ConfirmDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Supprimer le message"
        description="Le message sera définitivement effacé."
        onConfirm={handleDelete}
      />
    </div>
  );
}
