
CREATE TABLE public.deck_case_studies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  issue text NOT NULL DEFAULT '',
  outcome text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  phases jsonb DEFAULT NULL,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.deck_case_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published case studies are viewable by everyone"
  ON public.deck_case_studies FOR SELECT
  TO anon
  USING (is_published = true);

CREATE POLICY "Authenticated users can view all case studies"
  ON public.deck_case_studies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert case studies"
  ON public.deck_case_studies FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update case studies"
  ON public.deck_case_studies FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete case studies"
  ON public.deck_case_studies FOR DELETE
  TO authenticated
  USING (true);
