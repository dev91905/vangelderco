-- Revoke SELECT on the password column from the anon role
-- This prevents unauthenticated users from reading post passwords via the API
REVOKE SELECT (password) ON public.capability_posts FROM anon;

-- Grant SELECT on all OTHER columns explicitly to anon
-- (Required because revoking one column may affect default grants)
GRANT SELECT (id, capability, type, title, slug, excerpt, content, hero_image_url, content_blocks, stats, is_published, published_at, created_at) ON public.capability_posts TO anon;