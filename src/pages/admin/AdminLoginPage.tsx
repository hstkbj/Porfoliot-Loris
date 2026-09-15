import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useToast } from '../../components/ui/toast';
import { Lock, ArrowLeft, ShieldCheck, Key } from 'lucide-react';

interface AdminLoginPageProps {
  onBackToSite: () => void;
}

export function AdminLoginPage({ onBackToSite }: AdminLoginPageProps) {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('admin@studio.com');
  const [password, setPassword] = useState('Admin2026!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: 'Connexion réussie',
        message: 'Bienvenue dans l’espace d’administration.',
        type: 'success',
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Identifiants invalides');
      toast({
        title: 'Échec de connexion',
        message: err?.message || 'Identifiants invalides',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@studio.com');
    setPassword('Admin2026!');
  };

  return (
    <div className="min-h-screen bg-[#090a0c] flex flex-col justify-center items-center px-4 py-12">
      {/* Back to site button */}
      <div className="w-full max-w-md mb-6">
        <button
          onClick={onBackToSite}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 transition-colors font-mono cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Retour au site public</span>
        </button>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#121417] p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl font-bold text-zinc-100">
            Espace d'Administration
          </h2>
          <p className="text-xs text-zinc-400">
            Connectez-vous pour gérer vos réalisations, services, devis et profil.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Email administrateur</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@studio.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-zinc-300">Mot de passe</label>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            variant="accent"
            size="lg"
            isLoading={isLoading}
            className="w-full justify-center text-sm font-semibold"
          >
            Se connecter
          </Button>
        </form>

        {/* Demo hints */}
        <div className="rounded-xl border border-zinc-850 bg-zinc-900/60 p-4 space-y-2 text-xs text-zinc-400">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-zinc-300 flex items-center gap-1.5 font-mono text-[11px]">
              <Key className="h-3.5 w-3.5 text-amber-400" />
              Identifiants par défaut
            </span>
            <button
              onClick={handleFillDemo}
              className="text-[11px] text-amber-400 hover:underline cursor-pointer"
            >
              Remplir
            </button>
          </div>
          <p className="text-[11px] font-mono text-zinc-400">
            Email : <span className="text-zinc-200">admin@studio.com</span>
            <br />
            Mot de passe : <span className="text-zinc-200">Admin2026!</span>
          </p>
        </div>
      </div>
    </div>
  );
}
