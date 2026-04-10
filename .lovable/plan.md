

# Reframe the Deck as a Client Intake Tool

## The Shift

Right now the deck reads as an educational walkthrough — "here's what's broken, here's how we work." The reframe: it's a **guided intake experience** where the prospect self-diagnoses, learns just enough to be dangerous, and exits with a clear next step (book a call or submit for review). Their selections and responses become an intake log you review on the backend.

## What Changes

### 1. Rewrite the Framing Copy (Frames 1, 2, 10, 11)

**Frame 1 (Hero):** Shift from "learning module" to invitation. Something like:
- Headline: "Let's figure out if there's a fit."
- Subhead: "This is a five-minute walkthrough that helps us understand your situation — and shows you how we think about it."
- CTA: "Get started" (not "Start the walkthrough")

**Frame 2 (Self-Diagnosis):** Rewrite header from "What are your biggest challenges?" to something warmer and intake-oriented — "Tell us where you are." The subtext should frame this as useful for both parties: "This helps us understand your situation before we talk."

**Frame 10 (The Promise):** Tighten as a transition to the close — less aspirational, more "here's what happens next with what you've told us."

**Frame 11 (CTA):** This is the money slide. Rewrite entirely:
- Headline: "We've got a picture. Let's talk."
- Show a summary of what they selected (pain points, custom challenge, engagement path) as a compact "intake summary" card
- Two clear CTAs: **Book a Call** (primary, if booking link exists) and **Send This to Our Team** (secondary, submits their info + selections via email)
- The form stays but the framing changes — it's not "email us," it's "send your intake for review"

### 2. Surface Intake Summary on the CTA Slide

On Frame 11, dynamically render a small summary block showing:
- Selected pain points (from Frame 2)
- Custom challenge text (if entered)
- Engagement path chosen (fresh vs. experienced, from Frame 8)
- Domains of interest (from Frame 5)

This gives the prospect a sense of "my data is being captured" and gives you a complete picture when the submission hits the backend.

### 3. Persist All Selections to `deck_contacts`

The current `handleCtaSubmit` already saves `selected_pains` and `custom_challenge`. Extend it to also save:
- `engagement_path` (fresh/experienced)
- `selected_domains` (cultural/cross-sector/organizing)

This requires adding two columns to `deck_contacts`:
- `engagement_path TEXT` (nullable)
- `selected_domains TEXT[]` (nullable)

### 4. Rewrite Transitional Copy Throughout

Audit every frame's header/subhead copy to shift tone from "here's a presentation" to "here's a conversation." Key rewrites:
- Frame 3 (Confrontation): Keep as-is — it's the strongest content
- Frame 4 (Hallmarks): "Stratcomm portfolios that get results..." → "Here's what separates portfolios that move policy from ones that report on awareness."
- Frame 5 (Domains): "You're ready to level up" → "Where do you need the most help?" — make it interactive/intake-oriented
- Frame 8 (Working Together): "How do you want to start?" is already good — keep it
- Frame 13 (Spacer): Replace dead-end spacer with a redirect back to the CTA or a "thank you" if they already submitted

### 5. Rewrite the Homepage CTA Section

Update the bottom of Index.tsx to match the new framing. Instead of "You already know something isn't working" → something like "Five minutes. One walkthrough. See if there's a fit." The button copy "Show me" becomes "Start the intake" or "Let's see."

## Technical Summary

- **Migration:** Add `engagement_path` and `selected_domains` columns to `deck_contacts`
- **Deck.tsx:** Rewrite copy across ~8 frames, add intake summary to Frame 11, persist new fields on submit
- **Index.tsx:** Update CTA section copy and button label
- No new tables, no new pages, no auth changes

