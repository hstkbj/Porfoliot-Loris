-- ==============================================================================
-- SEED DATA - PORTFOLIO MONTEUR VIDÉO & MOTION DESIGNER
-- ==============================================================================

-- 1. CRÉATION DU COMPTE ADMINISTRATEUR SUPABASE AUTH
-- Identifiants initiaux : admin@studio.com / Admin2026!
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

DO $$
DECLARE
  admin_uid UUID := '00000000-0000-0000-0000-000000000001';
  admin_email TEXT := 'admin@studio.com';
  admin_password TEXT := 'Admin2026!';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      admin_uid,
      'authenticated',
      'authenticated',
      admin_email,
      extensions.crypt(admin_password, extensions.gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"admin","first_name":"Alexandre","last_name":"Roche"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );

    -- Enregistrement de l'identité dans auth.identities
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      admin_uid,
      admin_uid,
      format('{"sub":"%s","email":"%s"}', admin_uid::text, admin_email)::jsonb,
      'email',
      NOW(),
      NOW(),
      NOW()
    );
  END IF;
END $$;

-- 2. PROFIL PROFESSIONNEL
-- ==============================================================================
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
) ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  professional_name = EXCLUDED.professional_name,
  job_title = EXCLUDED.job_title,
  bio = EXCLUDED.bio,
  short_bio = EXCLUDED.short_bio,
  photo_url = EXCLUDED.photo_url,
  location = EXCLUDED.location,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  years_experience = EXCLUDED.years_experience,
  availability = EXCLUDED.availability,
  hero_title = EXCLUDED.hero_title,
  hero_description = EXCLUDED.hero_description;

-- 3. PARAMÈTRES DU SITE & TRANCHES BUDGÉTAIRES EN XOF
-- ==============================================================================
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
) ON CONFLICT (id) DO UPDATE SET
  site_name = EXCLUDED.site_name,
  site_description = EXCLUDED.site_description,
  budget_tiers = EXCLUDED.budget_tiers;

-- 4. SERVICES PROPOSÉS (Tarifs réalistes en XOF)
-- ==============================================================================
INSERT INTO public.services (id, title, slug, description, icon, indicative_price, indicative_duration, active, display_order)
VALUES
  (
    '33333333-3333-3333-3333-333333333301',
    'Montage Vidéo Haut de Gamme',
    'montage-video',
    'Montage dynamique et structuré pour vos publicités, documentaires, films institutionnels ou productions web. Colorimétrie avancée et sound design inclus.',
    'Film',
    'À partir de 75 000 XOF',
    '3 à 7 jours de production',
    true,
    1
  ),
  (
    '33333333-3333-3333-3333-333333333302',
    'Motion Design & Animation 2D/3D',
    'motion-design',
    'Création d''animations graphiques percutantes, titrages cinématiques, explainer videos, infographies animées et identités en mouvement.',
    'Sparkles',
    'À partir de 100 000 XOF',
    '4 à 10 jours de production',
    true,
    2
  ),
  (
    '33333333-3333-3333-3333-333333333303',
    'Contenus Verticaux & Social Media',
    'social-media',
    'Reels, TikToks et Shorts calibrés pour maximiser l''engagement et le taux de complétion avec transitions millimétrées et sous-titrages animés sur-mesure.',
    'Smartphone',
    'À partir de 25 000 XOF',
    '24 à 48 heures',
    true,
    3
  ),
  (
    '33333333-3333-3333-3333-333333333304',
    'Vidéo Corporate & Événementiel',
    'video-corporate',
    'Valorisation de votre marque employeur, reportages d''entreprise, lancements de produit et aftermovies événementiels à forte valeur émotionnelle.',
    'Building2',
    'Sur devis (dès 150 000 XOF)',
    '5 à 12 jours de production',
    true,
    4
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  indicative_price = EXCLUDED.indicative_price,
  indicative_duration = EXCLUDED.indicative_duration;

-- 5. PROJETS DE RÉALISATION
-- ==============================================================================
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
    'Vortex Formula — Récapitulatif Grand Prix',
    'vortex-formula-recapitulatif-grand-prix',
    'Aftermovie à haute intensité adrenaline avec transitions dynamiques, speed-ramping et effets sonores percutants.',
    'Montage multicaméra haute vitesse couvrant les 3 jours d''épreuves. Sound design de moteurs et de radio de bord retranscrit en stéréo binaurale.',
    'Événementiel',
    'Vortex Racing League',
    2024,
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    ARRAY['Premiere Pro', 'DaVinci Resolve'],
    false,
    true,
    5
  ),
  (
    '44444444-4444-4444-4444-444444444406',
    'Pulse Fitness — Série Social Media Shorts',
    'pulse-fitness-serie-social-media',
    'Package de 15 formats verticaux (Reels/Shorts) optimisés pour la rétention et l''acquisition mobile.',
    'Sous-titrages cinématiques animés mot-à-mot, sound design punchy et transitions d''action synchronisées aux mouvements du coach.',
    'Social Media',
    'Pulse Club',
    2024,
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    ARRAY['Premiere Pro', 'After Effects', 'CapCut Pro'],
    false,
    true,
    6
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  tools = EXCLUDED.tools;

-- 6. COMPÉTENCES TECHNIQUES (SKILLS)
-- ==============================================================================
INSERT INTO public.skills (id, name, category, level, icon, display_order)
VALUES
  ('55555555-5555-5555-5555-555555555501', 'Premiere Pro', 'Logiciels', 98, 'Film', 1),
  ('55555555-5555-5555-5555-555555555502', 'After Effects', 'Logiciels', 95, 'Sparkles', 2),
  ('55555555-5555-5555-5555-555555555503', 'DaVinci Resolve', 'Logiciels', 92, 'Palette', 3),
  ('55555555-5555-5555-5555-555555555504', 'Cinema 4D', 'Logiciels', 80, 'Box', 4),
  ('55555555-5555-5555-5555-555555555505', 'Sound Design & Mixage', 'Savoir-faire', 94, 'Volume2', 5),
  ('55555555-5555-5555-5555-555555555506', 'Étalonnage & Color Grading', 'Savoir-faire', 90, 'Sun', 6),
  ('55555555-5555-5555-5555-555555555507', 'Storytelling & Rythme', 'Savoir-faire', 96, 'HeartHandshake', 7),
  ('55555555-5555-5555-5555-555555555508', 'Formats Courts & Rétention', 'Savoir-faire', 95, 'TrendingUp', 8)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  level = EXCLUDED.level;

-- 7. LIENS SOCIAUX
-- ==============================================================================
INSERT INTO public.social_links (id, platform, url, active, display_order)
VALUES
  ('66666666-6666-6666-6666-666666666601', 'YouTube', 'https://youtube.com', true, 1),
  ('66666666-6666-6666-6666-666666666602', 'Vimeo', 'https://vimeo.com', true, 2),
  ('66666666-6666-6666-6666-666666666603', 'Instagram', 'https://instagram.com', true, 3),
  ('66666666-6666-6666-6666-666666666604', 'LinkedIn', 'https://linkedin.com', true, 4)
ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url;

-- 8. EXEMPLES DE DEMANDES DE DEVIS (EN XOF)
-- ==============================================================================
INSERT INTO public.service_requests (
  id, full_name, email, phone, company, project_type, budget_range, deadline, message, status, created_at
) VALUES
  (
    '77777777-7777-7777-7777-777777777701',
    'Amadou Traoré',
    'amadou.traore@nova-tech.sn',
    '+221 77 555 12 34',
    'NovaTech Solutions',
    'Vidéo corporate',
    '250 000 - 500 000 XOF',
    'Sous 3 semaines',
    'Bonjour Alexandre, nous recherchons un monteur pour finaliser notre film de présentation annuel (environ 2 min 30). Les rushes 4K sont déjà tournés.',
    'nouveau',
    NOW() - INTERVAL '2 days'
  ),
  (
    '77777777-7777-7777-7777-777777777702',
    'Fatou Diop',
    'fatou@lumina-creatives.com',
    '+225 07 88 99 00',
    'Lumina Agency',
    'Motion design',
    '100 000 - 250 000 XOF',
    'Urgent (sous 10 jours)',
    'Bonjour, nous avons besoin d''une animation 2D de 45 secondes pour expliquer le fonctionnement de notre nouvelle application mobile.',
    'en_cours',
    NOW() - INTERVAL '5 days'
  )
ON CONFLICT (id) DO NOTHING;

-- 9. EXEMPLES DE MESSAGES DE CONTACT
-- ==============================================================================
INSERT INTO public.contact_messages (
  id, name, email, phone, subject, message, is_read, created_at
) VALUES
  (
    '88888888-8888-8888-8888-888888888801',
    'Sarah Ndiaye',
    'sarah.ndiaye@artisan-agency.com',
    '+33 6 12 34 56 78',
    'Collaboration montage série web',
    'Bonjour Alexandre, j''ai découvert ton portfolio et j''apprécie particulièrement le rythme de tes découpes. Serais-tu disponible pour une série de 6 épisodes le mois prochain ?',
    false,
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;
