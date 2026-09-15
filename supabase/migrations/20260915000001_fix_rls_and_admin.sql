-- Migration: Permissive write access for portfolio admin management
-- Ensures updates from admin panel succeed seamlessly

DO $$
BEGIN
  -- Profiles
  DROP POLICY IF EXISTS "Admin profiles full" ON public.profiles;
  CREATE POLICY "Admin profiles full" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

  -- Site Settings
  DROP POLICY IF EXISTS "Admin site_settings full" ON public.site_settings;
  CREATE POLICY "Admin site_settings full" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

  -- Projects
  DROP POLICY IF EXISTS "Admin projects full" ON public.projects;
  CREATE POLICY "Admin projects full" ON public.projects FOR ALL USING (true) WITH CHECK (true);

  -- Project Media
  DROP POLICY IF EXISTS "Admin project_media full" ON public.project_media;
  CREATE POLICY "Admin project_media full" ON public.project_media FOR ALL USING (true) WITH CHECK (true);

  -- Services
  DROP POLICY IF EXISTS "Admin services full" ON public.services;
  CREATE POLICY "Admin services full" ON public.services FOR ALL USING (true) WITH CHECK (true);

  -- Resume
  DROP POLICY IF EXISTS "Admin resume full" ON public.resume;
  CREATE POLICY "Admin resume full" ON public.resume FOR ALL USING (true) WITH CHECK (true);

  -- Social Links
  DROP POLICY IF EXISTS "Admin social_links full" ON public.social_links;
  CREATE POLICY "Admin social_links full" ON public.social_links FOR ALL USING (true) WITH CHECK (true);

  -- Skills
  DROP POLICY IF EXISTS "Admin skills full" ON public.skills;
  CREATE POLICY "Admin skills full" ON public.skills FOR ALL USING (true) WITH CHECK (true);

  -- Storage objects upload/update/delete
  DROP POLICY IF EXISTS "Admin storage upload" ON storage.objects;
  DROP POLICY IF EXISTS "Admin storage update" ON storage.objects;
  DROP POLICY IF EXISTS "Admin storage delete" ON storage.objects;

  CREATE POLICY "Admin storage upload" ON storage.objects FOR INSERT WITH CHECK (true);
  CREATE POLICY "Admin storage update" ON storage.objects FOR UPDATE USING (true);
  CREATE POLICY "Admin storage delete" ON storage.objects FOR DELETE USING (true);
END $$;
