import React, { useState } from 'react';
import { useResume, useUploadResume, useDeleteResume } from '../../hooks/useData';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { useToast } from '../../components/ui/toast';
import { formatDate } from '../../lib/utils';
import { FileText, Upload, Download, Trash2, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

export function AdminResumeTab() {
  const { data: resume, isLoading } = useResume();
  const uploadResumeMutation = useUploadResume();
  const deleteResumeMutation = useDeleteResume();
  const { toast } = useToast();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [customFileName, setCustomFileName] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      toast({
        title: 'Format non autorisé',
        message: 'Le fichier doit être impérativement au format PDF.',
        type: 'error',
      });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: 'Fichier trop lourd',
        message: 'La taille maximale autorisée est de 20 Mo.',
        type: 'error',
      });
      return;
    }

    setIsUploading(true);
    try {
      await uploadResumeMutation.mutateAsync(file);
      toast({
        title: 'CV mis à jour',
        message: 'Le nouveau fichier PDF a été mis en ligne avec succès.',
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Échec de mise en ligne',
        message: err?.message || 'Une erreur est survenue lors de l’envoi.',
        type: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteResumeMutation.mutateAsync();
      toast({
        title: 'CV supprimé',
        message: 'Le CV a été retiré du site public.',
        type: 'info',
      });
      setIsDeleting(false);
    } catch (err: any) {
      toast({
        title: 'Erreur',
        message: err?.message || 'Échec de la suppression.',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-display text-xl font-bold text-zinc-100">
          Gestion du Curriculum Vitae (PDF)
        </h2>
        <p className="text-xs text-zinc-400">
          Ce fichier PDF est consultable et téléchargeable par les recruteurs et clients depuis la page "À propos".
        </p>
      </div>

      {/* Current Resume Status Card */}
      <div className="rounded-xl border border-zinc-800 bg-[#121417] p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400 border border-amber-500/20">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-100">
                {resume?.file_name || 'Aucun CV en ligne'}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {resume
                  ? `Taille : ${resume.file_size || 'N/A'} • Mis à jour le : ${formatDate(
                      resume.uploaded_at
                    )}`
                  : 'Téléversez votre CV au format PDF ci-dessous.'}
              </p>
            </div>
          </div>

          {resume?.file_url && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs text-emerald-400 font-mono">
              <CheckCircle2 className="h-3 w-3" />
              <span>En ligne</span>
            </span>
          )}
        </div>

        {resume?.file_url && (
          <div className="pt-2 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(resume.file_url, '_blank')}
              className="text-xs gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Aperçu du PDF</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleting(true)}
              className="text-xs gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Supprimer le CV</span>
            </Button>
          </div>
        )}
      </div>

      {/* Upload Box */}
      <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-8 text-center space-y-4 hover:border-zinc-500 transition-colors">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-zinc-300">
          <Upload className="h-5 w-5" />
        </div>

        <div className="space-y-1">
          <h4 className="font-semibold text-sm text-zinc-200">
            {resume ? 'Remplacer le CV actuel' : 'Téléverser un nouveau CV'}
          </h4>
          <p className="text-xs text-zinc-400">
            Glissez-déposez votre fichier ici, ou cliquez pour parcourir vos dossiers (Format PDF uniquement, max 20 Mo).
          </p>
        </div>

        <div className="relative inline-block">
          <Button variant="accent" size="sm" isLoading={isUploading} className="pointer-events-none">
            Sélectionner un fichier PDF
          </Button>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={isDeleting}
        onOpenChange={setIsDeleting}
        title="Supprimer le CV"
        description="Le fichier sera retiré du site. Les visiteurs ne pourront plus le télécharger."
        onConfirm={handleDelete}
      />
    </div>
  );
}
