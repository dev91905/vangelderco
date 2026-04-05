
ALTER TABLE public.capability_posts ADD COLUMN password text DEFAULT NULL;

CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON public.site_settings FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can manage settings" ON public.site_settings FOR ALL TO public USING (true) WITH CHECK (true);

INSERT INTO public.site_settings (key, value) VALUES ('global_article_password', NULL);
