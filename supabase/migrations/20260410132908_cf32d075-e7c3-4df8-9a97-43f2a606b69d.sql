ALTER TABLE public.capability_posts
  ADD COLUMN is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN sector_label text,
  ADD COLUMN featured_stat text;