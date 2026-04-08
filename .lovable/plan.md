

# Add "Something Else" Option + Submissions Feed

## What we're building

1. **Slide 2**: A 6th card styled differently ("Something else?") that, when clicked, expands an inline text input. User types their issue, hits enter, it saves to the database and shows a confirmation.

2. **Database**: New `deck_submissions` table to store these free-text responses with timestamp.

3. **Admin panel**: A new "Submissions" feed section on the Admin page — a clean, chronological list of all custom responses people have entered, with relative timestamps.

## Technical plan

### 1. Create `deck_submissions` table (migration)

```sql
create table public.deck_submissions (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.deck_submissions enable row level security;

-- Anyone can insert (public deck, no auth required)
create policy "Anyone can submit" on public.deck_submissions
  for insert to anon, authenticated with check (true);

-- Only authenticated users can read (admin panel)
create policy "Authenticated can read" on public.deck_submissions
  for select to authenticated using (true);
```

### 2. Slide 2 — 6th card (`src/pages/Deck.tsx`)

- Add a 6th card to the grid after the 5 PAIN_POINTS cards
- Styled with a dashed border, slightly different from the others — signals "write your own"
- Label: **"Something else"** with subtext like "Tell us what you're dealing with"
- On click: expands an inline textarea + submit button (no modal)
- On submit: inserts into `deck_submissions`, shows brief "Thanks" confirmation, collapses back
- No auth required — anonymous insert

### 3. Admin panel — Submissions feed (`src/pages/Admin.tsx`)

- Add a collapsible "Deck Submissions" section below the post list (or as a tab)
- Simple feed: each submission is a card with the message text + relative timestamp ("3 hours ago")
- Sorted newest-first
- Query via Supabase client (authenticated, so RLS allows reads)
- Clean, minimal design matching existing admin aesthetic

## Files modified
- `src/pages/Deck.tsx` — add 6th card with inline input + submit logic
- `src/pages/Admin.tsx` — add submissions feed section
- New migration for `deck_submissions` table

