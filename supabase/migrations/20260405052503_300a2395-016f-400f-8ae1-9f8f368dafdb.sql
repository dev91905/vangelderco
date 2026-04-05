-- =============================================
-- 1. CAPABILITY_POSTS: Tighten write policies
-- =============================================

-- Drop the overly permissive "Temp" policies
DROP POLICY IF EXISTS "Temp: anyone can insert" ON public.capability_posts;
DROP POLICY IF EXISTS "Temp: anyone can update" ON public.capability_posts;
DROP POLICY IF EXISTS "Temp: anyone can delete" ON public.capability_posts;

-- Drop the overly broad SELECT policy (keep the published-only one for public)
DROP POLICY IF EXISTS "All posts visible for editing" ON public.capability_posts;

-- Authenticated users can do everything (admin)
CREATE POLICY "Authenticated users can select all posts"
  ON public.capability_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert posts"
  ON public.capability_posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update posts"
  ON public.capability_posts FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete posts"
  ON public.capability_posts FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- 2. SITE_SETTINGS: Restrict to authenticated
-- =============================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can manage settings" ON public.site_settings;
DROP POLICY IF EXISTS "Anyone can read settings" ON public.site_settings;

-- Only authenticated users can read and manage settings
CREATE POLICY "Authenticated users can read settings"
  ON public.site_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert settings"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =============================================
-- 3. STORAGE: Restrict write access
-- =============================================

-- Drop public write policies on post-images
DROP POLICY IF EXISTS "Anyone can upload post images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update post images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete post images" ON storage.objects;

-- Only authenticated users can write to post-images
CREATE POLICY "Authenticated users can upload post images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Authenticated users can update post images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated users can delete post images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'post-images');
