
-- Create deck_contacts table for CTA form submissions
CREATE TABLE public.deck_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  organization TEXT,
  email TEXT NOT NULL,
  custom_challenge TEXT,
  selected_pains TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deck_contacts ENABLE ROW LEVEL SECURITY;

-- Anyone can submit
CREATE POLICY "Anyone can submit contact" ON public.deck_contacts
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Only authenticated users can read
CREATE POLICY "Authenticated can read contacts" ON public.deck_contacts
  FOR SELECT TO authenticated USING (true);

-- Insert booking_link setting
INSERT INTO public.site_settings (key, value)
VALUES ('booking_link', null)
ON CONFLICT DO NOTHING;
