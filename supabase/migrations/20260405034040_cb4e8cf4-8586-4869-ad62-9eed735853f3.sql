
ALTER TABLE public.capability_posts
  ADD COLUMN slug text UNIQUE,
  ADD COLUMN hero_image_url text,
  ADD COLUMN content_blocks jsonb,
  ADD COLUMN stats jsonb;

CREATE UNIQUE INDEX idx_capability_posts_slug ON public.capability_posts (slug);
