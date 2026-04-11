
-- Create the impact_stats table
CREATE TABLE public.impact_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  post_id UUID REFERENCES public.capability_posts(id) ON DELETE CASCADE,
  case_study_id UUID REFERENCES public.deck_case_studies(id) ON DELETE CASCADE,
  phase_title TEXT,
  visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_impact_stats_post_id ON public.impact_stats(post_id);
CREATE INDEX idx_impact_stats_case_study_id ON public.impact_stats(case_study_id);

-- Enable RLS
ALTER TABLE public.impact_stats ENABLE ROW LEVEL SECURITY;

-- Public can read visible stats
CREATE POLICY "Visible stats are viewable by everyone"
  ON public.impact_stats FOR SELECT TO anon
  USING (visible = true);

-- Authenticated full access
CREATE POLICY "Authenticated users can view all stats"
  ON public.impact_stats FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert stats"
  ON public.impact_stats FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update stats"
  ON public.impact_stats FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete stats"
  ON public.impact_stats FOR DELETE TO authenticated
  USING (true);

-- Migrate existing capability_posts stats
INSERT INTO public.impact_stats (label, description, post_id, visible, sort_order)
SELECT
  s->>'label',
  COALESCE(s->>'description', ''),
  cp.id,
  COALESCE((s->>'visible')::boolean, true),
  row_number() OVER (PARTITION BY cp.id ORDER BY ordinality) - 1
FROM public.capability_posts cp,
     jsonb_array_elements(cp.stats) WITH ORDINALITY AS t(s, ordinality)
WHERE cp.stats IS NOT NULL AND jsonb_typeof(cp.stats) = 'array';

-- Migrate existing deck_case_studies phase stats
INSERT INTO public.impact_stats (label, description, case_study_id, phase_title, visible, sort_order)
SELECT
  stat->>'label',
  COALESCE(stat->>'value', ''),
  dcs.id,
  phase->>'title',
  true,
  row_number() OVER (PARTITION BY dcs.id, phase->>'title' ORDER BY stat_ord) - 1
FROM public.deck_case_studies dcs,
     jsonb_array_elements(dcs.phases) WITH ORDINALITY AS p(phase, phase_ord),
     jsonb_array_elements(phase->'stats') WITH ORDINALITY AS s(stat, stat_ord)
WHERE dcs.phases IS NOT NULL AND jsonb_typeof(dcs.phases) = 'array';
