
CREATE TABLE public.capability_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  capability TEXT NOT NULL CHECK (capability IN ('cultural-strategy', 'cross-sector', 'deep-organizing')),
  type TEXT NOT NULL CHECK (type IN ('case-study', 'blog-post')),
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.capability_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published posts are viewable by everyone"
  ON public.capability_posts
  FOR SELECT
  USING (is_published = true);

CREATE INDEX idx_capability_posts_capability ON public.capability_posts (capability);
CREATE INDEX idx_capability_posts_published ON public.capability_posts (is_published, published_at DESC);
