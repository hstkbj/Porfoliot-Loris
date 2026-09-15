import { useProfile, useSkills, useResume, useSocialLinks } from '../hooks/useData';
import { Button } from '../components/ui/button';
import { Download, MapPin, Mail, Phone, Calendar, ArrowUpRight, CheckCircle2, FileText } from 'lucide-react';
import { useToast } from '../components/ui/toast';

interface AboutPageProps {
  onRequestContact: () => void;
}

export function AboutPage({ onRequestContact }: AboutPageProps) {
  const { data: profile } = useProfile();
  const { data: skills = [] } = useSkills();
  const { data: resume } = useResume();
  const { data: socialLinks = [] } = useSocialLinks();
  const { toast } = useToast();

  const handleDownloadCV = () => {
    if (!resume?.file_url) {
      toast({
        title: 'CV indisponible',
        message: 'Le CV est en cours de mise à jour par l’administrateur.',
        type: 'info',
      });
      return;
    }

    // Open/download PDF
    window.open(resume.file_url, '_blank');
    toast({
      title: 'Téléchargement initié',
      message: `Téléchargement de ${resume.file_name}`,
      type: 'success',
    });
  };

  const softwareSkills = skills.filter((s) => s.category === 'Logiciel');
  const creativeSkills = skills.filter((s) => s.category !== 'Logiciel');

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      {/* 1. Main Bio & Profile Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Photo Column */}
        <div className="lg:col-span-5">
          <div className="relative rounded-2xl border border-zinc-800 bg-[#121417] p-3 shadow-xl overflow-hidden group">
            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-zinc-900">
              <img
                src={
                  profile?.photo_url ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
                }
                alt={profile?.professional_name || 'Monteur Vidéo'}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Availability Pill */}
            {profile?.availability && (
              <div className="mt-3 flex items-center justify-between px-2 py-1 text-xs text-zinc-400 font-mono">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-300">Disponible pour missions</span>
                </div>
                <span>Freelance</span>
              </div>
            )}
          </div>

          {/* CV Card Section */}
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-[#121417] p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-display font-bold text-zinc-100 text-sm">
                  Curriculum Vitae (PDF)
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {resume ? `${resume.file_name} (${resume.file_size || 'PDF'})` : 'CV disponible'}
                </p>
              </div>
            </div>

            <Button
              variant="accent"
              className="w-full justify-center gap-2 text-xs font-semibold"
              onClick={handleDownloadCV}
            >
              <Download className="h-4 w-4" />
              <span>Télécharger mon CV</span>
            </Button>
          </div>
        </div>

        {/* Bio & Details Column */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase font-mono">
              À Propos
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-zinc-100 mt-1">
              {profile ? `${profile.first_name} ${profile.last_name}` : 'Alexandre Roche'}
            </h1>
            <h2 className="text-lg font-medium text-zinc-400 mt-1 font-mono">
              {profile?.job_title || 'Monteur Vidéo & Motion Designer Senior'}
            </h2>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-y border-zinc-850 py-6">
            <div>
              <span className="text-xs text-zinc-500 font-mono block">Expérience</span>
              <span className="font-display text-2xl font-bold text-zinc-100">
                {profile?.years_experience || 7}+ Années
              </span>
            </div>
            <div>
              <span className="text-xs text-zinc-500 font-mono block">Localisation</span>
              <span className="font-display text-base font-bold text-zinc-200 flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="line-clamp-1">{profile?.location?.split('/')[0] || 'Paris'}</span>
              </span>
            </div>
            <div>
              <span className="text-xs text-zinc-500 font-mono block">Mode de travail</span>
              <span className="font-display text-base font-bold text-zinc-200 mt-1 block">
                Remote & Studio
              </span>
            </div>
          </div>

          {/* Bio text */}
          <div className="space-y-4 text-sm sm:text-base text-zinc-300 leading-relaxed">
            <p className="whitespace-pre-line">{profile?.bio}</p>
          </div>

          {/* Contact Details & Socials */}
          <div className="space-y-4 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
              Coordonnées & Réseaux
            </h3>
            <div className="flex flex-wrap gap-4 text-xs text-zinc-300 font-mono">
              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-2 hover:text-amber-400 transition-colors"
                >
                  <Mail className="h-4 w-4 text-amber-400" />
                  <span>{profile.email}</span>
                </a>
              )}
              {profile?.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="flex items-center gap-2 hover:text-amber-400 transition-colors"
                >
                  <Phone className="h-4 w-4 text-amber-400" />
                  <span>{profile.phone}</span>
                </a>
              )}
            </div>

            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {socialLinks.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-600 hover:text-amber-400 transition-colors"
                  >
                    <span>{item.platform}</span>
                    <ArrowUpRight className="h-3 w-3 text-zinc-500" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Skills & Software Mastery */}
      <div className="rounded-2xl border border-zinc-800 bg-[#121417] p-8 sm:p-12 space-y-10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 font-mono">
            Compétences & Outils
          </span>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-zinc-100 mt-1">
            Environnement de travail et expertises
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Software stack */}
          <div className="space-y-4">
            <h4 className="font-display text-base font-semibold text-zinc-200">
              Logiciels & Stations de Post-Production
            </h4>
            <div className="space-y-3">
              {softwareSkills.map((s) => (
                <div key={s.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-zinc-200">{s.name}</span>
                    <span className="text-zinc-500 font-mono">{s.level}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${s.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Creative expertise */}
          <div className="space-y-4">
            <h4 className="font-display text-base font-semibold text-zinc-200">
              Disciplines & Savoir-faire
            </h4>
            <div className="space-y-3">
              {creativeSkills.map((s) => (
                <div key={s.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-zinc-200">{s.name}</span>
                    <span className="text-zinc-500 font-mono">{s.level}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${s.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
