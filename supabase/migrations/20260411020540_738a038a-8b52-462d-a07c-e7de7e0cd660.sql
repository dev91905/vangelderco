
-- Add new columns to deck_contacts
ALTER TABLE public.deck_contacts
  ADD COLUMN IF NOT EXISTS report_cache text,
  ADD COLUMN IF NOT EXISTS report_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS metrics_unchecked text[],
  ADD COLUMN IF NOT EXISTS sectors_not_selected text[];

-- Allow authenticated users to update deck_contacts (for report caching and status)
CREATE POLICY "Authenticated can update contacts"
  ON public.deck_contacts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
