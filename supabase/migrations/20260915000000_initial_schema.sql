-- ==============================================================================
-- Migration Supabase: Schema, Tables, RLS, Storage et Seeds
-- Portfolio Professionnel - Monteur Vidéo & Motion Designer
-- ==============================================================================

-- Enable UUID extension (pgcrypto provides gen_random_uuid, built-in in modern PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  professional_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  bio TEXT NOT NULL,
  short_bio TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  location TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  years_experience INTEGER NOT NULL DEFAULT 0,
  availability BOOLEAN NOT NULL DEFAULT true,
  hero_title TEXT NOT NULL,
  hero_description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SITE_SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL,
  site_description TEXT NOT NULL,
  logo_url TEXT,
  favicon_url TEXT,
  seo_title TEXT NOT NULL,
  seo_description TEXT NOT NULL,
  primary_color TEXT NOT NULL DEFAULT '#f59e0b',
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  location TEXT NOT NULL,
  copyright_text TEXT NOT NULL,
  budget_tiers TEXT[] NOT NULL DEFAULT ARRAY['Moins de 50 000 XOF', '50 000 - 100 000 XOF', '100 000 - 250 000 XOF', '250 000 - 500 000 XOF', '500 000 - 1 000 000 XOF', 'Plus de 1 000 000 XOF'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  client TEXT NOT NULL,
  year INTEGER NOT NULL,
  thumbnail_url TEXT NOT NULL,
  video_url TEXT NOT NULL,
  external_url TEXT,
  tools TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_published ON public.projects(published);
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON public.projects(display_order);

-- 4. PROJECT_MEDIA
CREATE TABLE IF NOT EXISTS public.project_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  title TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_media_project_id ON public.project_media(project_id);

-- 5. SERVICES
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  image_url TEXT,
  indicative_price TEXT,
  indicative_duration TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(active);
CREATE INDEX IF NOT EXISTS idx_services_order ON public.services(display_order);

-- 6. SERVICE_REQUESTS
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  budget TEXT,
  desired_date TEXT,
  description TEXT NOT NULL,
  reference_url TEXT,
  attachment_url TEXT,
  status TEXT NOT NULL DEFAULT 'Nouvelle' CHECK (status IN ('Nouvelle', 'En cours', 'Contacté', 'Terminée', 'Refusée')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON public.service_requests(created_at DESC);

-- 7. CONTACT_MESSAGES
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON public.contact_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);

-- 8. RESUME
CREATE TABLE IF NOT EXISTS public.resume (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. SOCIAL_LINKS
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. SKILLS
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 90,
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public site_settings read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public published projects read" ON public.projects FOR SELECT USING (published = true OR auth.role() = 'authenticated');
CREATE POLICY "Public project_media read" ON public.project_media FOR SELECT USING (true);
CREATE POLICY "Public active services read" ON public.services FOR SELECT USING (active = true OR auth.role() = 'authenticated');
CREATE POLICY "Public resume read" ON public.resume FOR SELECT USING (true);
CREATE POLICY "Public active social_links read" ON public.social_links FOR SELECT USING (active = true OR auth.role() = 'authenticated');
CREATE POLICY "Public active skills read" ON public.skills FOR SELECT USING (active = true OR auth.role() = 'authenticated');

-- Public insert policies for visitor forms
CREATE POLICY "Public service_requests insert" ON public.service_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public contact_messages insert" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- Admin authenticated full access policies
CREATE POLICY "Admin profiles full" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin site_settings full" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin projects full" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin project_media full" ON public.project_media FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin services full" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin service_requests full" ON public.service_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin contact_messages full" ON public.contact_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin resume full" ON public.resume FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin social_links full" ON public.social_links FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin skills full" ON public.skills FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- STORAGE BUCKETS SETUP
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('profile', 'profile', true),
  ('projects', 'projects', true),
  ('services', 'services', true),
  ('resume', 'resume', true),
  ('attachments', 'attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public storage read profile" ON storage.objects FOR SELECT USING (bucket_id IN ('profile', 'projects', 'services', 'resume'));
CREATE POLICY "Admin storage upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin storage update" ON storage.objects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin storage delete" ON storage.objects FOR DELETE TO authenticated USING (true);
CREATE POLICY "Public visitor attachment upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'attachments');

-- ==============================================================================
-- SEED DATA (Données de démonstration réalistes)
-- ==============================================================================

-- Profile
INSERT INTO public.profiles (
  id, first_name, last_name, professional_name, job_title, bio, short_bio,
  photo_url, location, email, phone, years_experience, availability, hero_title, hero_description
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Alexandre',
  'Roche',
  'Roche Motion Studio',
  'Monteur Vidéo & Motion Designer Senior',
  'Monteur vidéo et motion designer indépendant avec plus de 7 ans d''expérience au service d''agences créatives, de marques internationales et de créateurs de contenu exigeants. Spécialisé dans le montage narratif dynamique, le sound design immersif, le compositing et l''animation 2D/3D sur After Effects et DaVinci Resolve.',
  'Monteur vidéo & Motion Designer freelance. Je façonne des récits audiovisuels percutants alliant rigueur narrative et créativité visuelle.',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  'Paris, France / Disponible en télétravail',
  'contact@roche-motion.com',
  '+33 6 42 19 88 05',
  7,
  true,
  'MONTEUR VIDÉO & MOTION DESIGNER',
  'Je transforme vos idées en récits visuels rythmés, élégants et captivants. Du montage publicitaire à l''animation motion design complexe.'
) ON CONFLICT (id) DO NOTHING;

-- Site settings
INSERT INTO public.site_settings (
  id, site_name, site_description, logo_url, seo_title, seo_description,
  primary_color, contact_email, contact_phone, location, copyright_text, budget_tiers
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Roche Motion Studio',
  'Portfolio de monteur vidéo et motion designer senior. Montage publicitaire, corporate, clip musical et motion design 2D/3D.',
  '',
  'Alexandre Roche | Monteur Vidéo & Motion Designer',
  'Portfolio professionnel d''Alexandre Roche, Monteur Vidéo et Motion Designer freelance. Découvrez mes réalisations et demandez un devis pour vos projets.',
  '#f59e0b',
  'contact@roche-motion.com',
  '+33 6 42 19 88 05',
  'Paris, France & International (Remote)',
  '© 2026 Roche Motion Studio. Tous droits réservés.',
  ARRAY[
    'Moins de 50 000 XOF',
    '50 000 - 100 000 XOF',
    '100 000 - 250 000 XOF',
    '250 000 - 500 000 XOF',
    '500 000 - 1 000 000 XOF',
    'Plus de 1 000 000 XOF'
  ]::text[]
) ON CONFLICT (id) DO NOTHING;

-- Services
INSERT INTO public.services (id, title, slug, description, icon, indicative_price, indicative_duration, active, display_order)
VALUES
  ('33333333-3333-3333-3333-333333333301', 'Montage Vidéo Haut de Gamme', 'montage-video', 'Montage dynamique et structuré pour vos publicités, documentaires, films institutionnels ou productions web. Colorimétrie avancée et sound design inclus.', 'Film', 'À partir de 75 000 XOF', '3 à 7 jours de production', true, 1),
  ('33333333-3333-3333-3333-333333333302', 'Motion Design & Animation 2D/3D', 'motion-design', 'Création d''animations graphiques percutantes, titrages cinématiques, explainer videos, infographies animées et identités en mouvement.', 'Sparkles', 'À partir de 100 000 XOF', '4 à 10 jours de production', true, 2),
  ('33333333-3333-3333-3333-333333333303', 'Contenus Verticaux & Social Media', 'social-media', 'Reels, TikToks et Shorts calibrés pour maximiser l''engagement et le taux de complétion avec transitions millimétrées et sous-titrages animés sur-mesure.', 'Smartphone', 'À partir de 25 000 XOF', '24 à 48 heures', true, 3),
  ('33333333-3333-3333-3333-333333333304', 'Vidéo Corporate & Événementiel', 'video-corporate', 'Valorisation de votre marque employeur, reportages d''entreprise, lancements de produit et aftermovies événementiels à forte valeur émotionnelle.', 'Building2', 'Sur devis (dès 150 000 XOF)', '5 à 12 jours de production', true, 4)
ON CONFLICT (id) DO NOTHING;

-- Projects
INSERT INTO public.projects (
  id, title, slug, short_description, description, category, client, year,
  thumbnail_url, video_url, tools, featured, published, display_order
) VALUES
  (
    '44444444-4444-4444-4444-444444444401',
    'Chrono Pulse — Campagne Horlogère',
    'chrono-pulse-campagne-horlogere',
    'Spot publicitaire cinématique alliant prises de vue macro et motion design 3D pour une montre de prestige.',
    'Réalisation et montage du spot de lancement mondial pour la collection Pulse. Découpe au rythme d''un sound design percutant, retouches colorimétriques DaVinci Resolve et intégration d''éléments graphiques en surimpression cinématique.',
    'Publicité',
    'Aethel Watchmakers',
    2025,
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    ARRAY['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Cinema 4D'],
    true,
    true,
    1
  ),
  (
    '44444444-4444-4444-4444-444444444402',
    'Kinetic Horizons — Identité en Mouvement',
    'kinetic-horizons-identite-motion',
    'Système de motion design modulaire pour la chaîne média internationale Kinetic.',
    'Conception complète du packaging graphique : générique d''ouverture, bumpers de transition, habillages lower-thirds et cartes typographiques dynamiques adaptables à l''antenne et sur les réseaux.',
    'Motion Design',
    'Kinetic Media Labs',
    2025,
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    ARRAY['After Effects', 'Illustrator', 'Cinema 4D'],
    true,
    true,
    2
  ),
  (
    '44444444-4444-4444-4444-444444444403',
    'Neon Reverie — Clip Musical Électro',
    'neon-reverie-clip-musical',
    'Clip immersif mêlant prises de vue réelles, color grading néon cyberpunk et effets de glitch analogique.',
    'Montage rythmique synchronisé à la mesure pour l''artiste K-VEX. Conception d''effets visuels sur mesure, synchronisation d''éclairages réactifs et étalonnage chromatique à fort contraste.',
    'Clip musical',
    'SubWave Records',
    2024,
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    ARRAY['Premiere Pro', 'DaVinci Resolve', 'After Effects'],
    true,
    true,
    3
  ),
  (
    '44444444-4444-4444-4444-444444444404',
    'EcoNext Innovations — Film Corporate',
    'econext-innovations-film-corporate',
    'Film de marque corporate mettant en valeur les technologies durables de décarbonation.',
    'Structuration narrative axée sur l''émotion et la vision d''avenir. Intégration de titrages 3D élégants trackés sur les plans de tournage, mixage vocal soigné et ambiance sonore organique.',
    'Vidéo corporate',
    'EcoNext Group',
    2024,
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    ARRAY['Premiere Pro', 'After Effects', 'Audition'],
    false,
    true,
    4
  ),
  (
    '44444444-4444-4444-4444-444444444405',
    'Verveine Paris — Campagne Social First',
    'verveine-paris-social-first',
    'Série de 8 vidéos verticales haute rétention pour le lancement d''une fragrance naturelle.',
    'Montage dynamique au format 9:16 avec transitions sonores percutantes, sous-titres animés au mot près et animations typographiques soignées. Plus de 3,2M de vues cumulées en 2 semaines.',
    'Réseaux sociaux',
    'Maison Verveine',
    2025,
    'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    ARRAY['Premiere Pro', 'CapCut Pro', 'After Effects'],
    false,
    true,
    5
  ),
  (
    '44444444-4444-4444-4444-444444444406',
    'Genesis Apex — Teaser 3D & Typographie',
    'genesis-apex-teaser-3d-typographie',
    'Teaser d''annonce pour un festival d''art numérique avec typographie cinétique spatiale.',
    'Animation typographique expérimentale en 3D volumétrique, déformation géométrique et habillage sonore glitch / basse fréquence ultra-lourde.',
    'Animation',
    'Apex Digital Arts',
    2025,
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    ARRAY['After Effects', 'Cinema 4D', 'Octane Render', 'Audition'],
    true,
    true,
    6
  )
ON CONFLICT (id) DO NOTHING;

-- Skills
INSERT INTO public.skills (id, name, category, level, display_order, active)
VALUES
  ('55555555-5555-5555-5555-555555555501', 'Adobe Premiere Pro', 'Logiciel', 98, 1, true),
  ('55555555-5555-5555-5555-555555555502', 'Adobe After Effects', 'Logiciel', 95, 2, true),
  ('55555555-5555-5555-5555-555555555503', 'DaVinci Resolve & Fusion', 'Logiciel', 90, 3, true),
  ('55555555-5555-5555-5555-555555555504', 'Cinema 4D / Blender', 'Logiciel', 82, 4, true),
  ('55555555-5555-5555-5555-555555555505', 'Montage Rythmique & Narratif', 'Montage', 96, 5, true),
  ('55555555-5555-5555-5555-555555555506', 'Animation Typographique (Kinetic)', 'Motion Design', 94, 6, true),
  ('55555555-5555-5555-5555-555555555507', 'Sound Design & Mixage Audio', 'Audio & Étalonnage', 92, 7, true),
  ('55555555-5555-5555-5555-555555555508', 'Étalonnage Chromatique (Color Grading)', 'Audio & Étalonnage', 88, 8, true)
ON CONFLICT (id) DO NOTHING;

-- Social Links
INSERT INTO public.social_links (id, platform, url, active, display_order)
VALUES
  ('66666666-6666-6666-6666-666666666601', 'Vimeo', 'https://vimeo.com', true, 1),
  ('66666666-6666-6666-6666-666666666602', 'Behance', 'https://behance.net', true, 2),
  ('66666666-6666-6666-6666-666666666603', 'LinkedIn', 'https://linkedin.com', true, 3),
  ('66666666-6666-6666-6666-666666666604', 'Instagram', 'https://instagram.com', true, 4),
  ('66666666-6666-6666-6666-666666666605', 'YouTube', 'https://youtube.com', true, 5)
ON CONFLICT (id) DO NOTHING;

-- Initial Resume
INSERT INTO public.resume (id, file_name, file_url)
VALUES (
  '77777777-7777-7777-7777-777777777777',
  'CV_Alexandre_Roche_Monteur_MotionDesigner.pdf',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
) ON CONFLICT (id) DO NOTHING;
