create table public.deck_submissions (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.deck_submissions enable row level security;

create policy "Anyone can submit" on public.deck_submissions
  for insert to anon, authenticated with check (true);

create policy "Authenticated can read" on public.deck_submissions
  for select to authenticated using (true);