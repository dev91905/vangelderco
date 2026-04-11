

# Case Study Timeline Overlay — Full Redesign

## What's wrong now

The case study popup is a narrow `max-w-2xl` dialog with plain paragraphs stacked vertically. No visual hierarchy, no timeline, no sense of progression. The content is hardcoded as JSX inside `CASE_STUDIES` in `Deck.tsx`. There's no way for an admin to edit or create new case studies without touching code.

## The new experience

### 1. Full-screen overlay instead of a dialog

Replace the `Dialog` with a full-viewport overlay (100vw × 100dvh, z-50) that slides up over the deck. Dark semi-transparent backdrop. Close button top-right. The overlay is widescreen — content lives in a horizontally scrollable timeline that fills the width.

### 2. Interactive horizontal timeline

The overlay contains a **horizontal timeline** the user scrolls through (mouse wheel maps to horizontal scroll, or drag/swipe on mobile). Each phase is a "node" on a continuous line:

```text
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ● Issue        ● Blind Spot      ● Brief         ● Research       │
│  ─────────────────────────────────────────────────────────────────  │
│                    ● Coalition      ● Pilots        ● Results       │
│                                                                     │
│  [phase card]   [phase card]    [phase card]    [phase card]        │
└─────────────────────────────────────────────────────────────────────┘
```

- A thin horizontal line runs across the viewport with circular nodes at each phase
- The **active phase** node pulses subtly; others are dormant dots
- Below each node: a card with the phase title, date range, and description
- As you scroll horizontally, phases animate in with staggered fade-up — the line "draws" itself progressively
- Stat chips appear at the final "Results" node with the outcome metrics
- The connecting line uses a gradient that intensifies as you progress — a visual metaphor for momentum building

### 3. Data-driven from a structured format

Replace the hardcoded JSX `content` field in `CASE_STUDIES` with a structured `phases` array:

```typescript
type CasePhase = {
  title: string;       // "Research" / "Coalition & Cultural Strategy"
  date?: string;       // "Jan–Mar 2023"
  description: string; // The narrative text
  stats?: { value: string; label: string }[];  // Optional metrics for this phase
};

type CaseStudy = {
  name: string;
  issue: string;
  outcome: string;
  phases: CasePhase[] | null;  // null = "coming soon"
};
```

The Clean Energy Workforce case study gets converted from its current paragraph format into ~6 phases (Issue → Blind Spot → Brief → Research → Coalition Strategy → Pilots → Results). Every other case study stays `phases: null` and shows "Coming soon" in the overlay.

### 4. Admin-editable via the content manager

Add a **"Deck Case Studies"** section to the admin panel (or a dedicated editor route) where the admin can:

- See all case studies listed
- Click one to edit its phases inline
- Each phase is an editable card: title, date, description, optional stats
- Drag to reorder phases
- Add/remove phases with + / × buttons
- Changes save to a new `deck_case_studies` database table
- The timeline reconstructs itself live as phases are added/removed/reordered

**Database table: `deck_case_studies`**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | Case study name |
| issue | text | One-line issue description |
| outcome | text | One-line outcome |
| sort_order | integer | Display order in marquee |
| phases | jsonb | Array of `CasePhase` objects |
| is_published | boolean | Show in deck or not |
| created_at | timestamptz | Default now() |

RLS: anon SELECT where `is_published = true`, authenticated full CRUD.

### 5. Visual design details

- **Typography**: Inter for all text. Phase titles at 20px/700. Descriptions at 15px/400. Dates in uppercase 11px tracking-wide.
- **Colors**: Warm palette from design tokens. The timeline line is `ink(0.08)` with nodes at `ink(0.3)`, active node at `ink(0.7)`.
- **Animation**: Each phase card fades up + slides right as it enters the viewport (IntersectionObserver on horizontal scroll). The connecting line segment draws with a CSS `stroke-dashoffset` animation.
- **Results node**: Larger card with stat chips matching the published case study format. Subtle background tint to signal completion.
- **"Coming soon" state**: For cases without phases, the overlay shows the case name, issue, outcome, and a minimal "Full timeline coming soon" message centered in the viewport.

## Files to create/edit

- **`src/components/deck/CaseTimelineOverlay.tsx`** — New component: the full-screen overlay with horizontal scrolling timeline
- **`src/pages/Deck.tsx`** — Replace `Dialog` lightbox with `CaseTimelineOverlay`, convert `CASE_STUDIES` content to structured phases format, fetch from DB with fallback to hardcoded data
- **`src/index.css`** — Add timeline drawing animation keyframes
- **`src/pages/Admin.tsx`** — Add "Deck Case Studies" collapsible section
- **`src/components/admin/CaseStudyEditor.tsx`** — New component: inline editor for case study phases (add/remove/reorder/edit)
- **Database migration** — Create `deck_case_studies` table with RLS policies

## What stays the same

- The marquee gallery on slide 10 (just built) — untouched
- All other deck frames and interactions
- The published case study pages on the main site (separate system)

