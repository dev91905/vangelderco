-- Drop the existing permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can read settings" ON public.site_settings;

-- Allow authenticated users full read access
CREATE POLICY "Authenticated users can read all settings"
ON public.site_settings
FOR SELECT
TO authenticated
USING (true);

-- Allow anon users to read non-sensitive settings only
CREATE POLICY "Anon can read non-sensitive settings"
ON public.site_settings
FOR SELECT
TO anon
USING (key != 'global_article_password');
