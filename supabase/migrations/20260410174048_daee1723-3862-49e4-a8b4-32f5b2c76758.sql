ALTER TABLE public.deck_contacts ADD COLUMN readiness_score integer;
ALTER TABLE public.deck_contacts ADD COLUMN quiz_answers jsonb;
ALTER TABLE public.deck_contacts ADD COLUMN metrics_checked text[];
ALTER TABLE public.deck_contacts ADD COLUMN capabilities_ranked text[];
ALTER TABLE public.deck_contacts ADD COLUMN has_media_experience boolean;