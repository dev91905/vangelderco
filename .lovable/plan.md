

# Admin CRM + Deck CTA Overhaul

## Problem
1. **Admin**: "Deck Contacts" and "Deck Submissions" are two separate sections. Submissions only stores the custom challenge message, which is already duplicated in `deck_contacts.custom_challenge`. Redundant section.
2. **Deck CTA (Frame 10)**: Contact info is hidden behind a "Send Intake for Review" button. Name and email should be upfront — part of the flow, not gated behind an extra click. Two clear exit options: book a call, or submit and have you reach out.

## Changes

### 1. Admin — Merge into single "Contacts" section
- Remove `SubmissionsFeed` component entirely
- Rename "Deck Contacts" → "Contacts" — this is now a mini CRM
- Each contact card already shows all survey answers via the expandable detail view
- The custom challenge message is already stored in `custom_challenge` on `deck_contacts`
- No database changes needed — `deck_submissions` table stays (existing data), we just stop showing it separately and stop writing to it

### 2. Deck CTA (Frame 10) — Contact form is always visible
Current flow: See summary → click "Send Intake" → form appears → fill out → submit
New flow: See summary + contact form inline (name, org, email already visible) → two buttons at bottom:
- **"Submit & get your diagnostic"** — submits intake, shows thank-you with "we'll email your results"
- **"Book a call instead"** — submits intake AND opens booking link

The form fields (first name, last name, org, email) are always visible on Frame 10, not hidden behind a mode toggle. Remove the `ctaMode` state machine — there's no "choose" step anymore.

Copy for the CTA:
- Headline: "We've got a picture. Let's talk."
- Subhead: "Leave your details and we'll send your diagnostic. Or book a call and walk through it together."
- After submit: "Received ✓ — We're reviewing your intake now. A team member will follow up within two business days."

### 3. Stop double-writing to deck_submissions
In `handleCtaSubmit`, remove the line that inserts into `deck_submissions`. The custom challenge is already saved in `deck_contacts.custom_challenge`.

## Files to change
| File | Change |
|------|--------|
| `src/pages/Admin.tsx` | Remove `SubmissionsFeed`, rename section to "Contacts" |
| `src/pages/Deck.tsx` | Flatten CTA — form always visible, remove ctaMode state machine, remove deck_submissions insert, two action buttons below form |

