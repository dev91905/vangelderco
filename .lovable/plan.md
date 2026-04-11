

# Copy Overhaul — Implementing Claude's Final Audit

All changes are text/copy replacements. No structural or layout changes needed — the sections, components, and order are mostly correct already. Here's every change mapped to the document.

---

## Changes by File

### 1. `src/pages/Index.tsx`

**Section 2 — Our Practice (line 379)**
- Change `"We build next-generation strategic communications portfolios."` → `"We build advanced strategic communications portfolios."`

**Section 2 — Our Practice (line 392)**
- Change `"...who want their portfolio to hit harder."` → `"...who want their work to hit harder."`

**Section 2 — Body copy (line 401)**
- Change `"Cultural strategy, media-based organizing, and campaign development, so your grants don't just fund content — they build power."` → `"Cultural strategy, media-based organizing, and campaign development — so your grants don't just fund content. They build power."`

**Section 3 — Capabilities array (lines 27-48)** — Replace all three capability descriptions:
- Cultural Strategy `sub`: `"We don't just push your message out."` / `detail`: `"We make sure the right people pick it up — across music, entertainment, news, digital creators, and every cultural sector with reach and influence."`
- Cross-Sector `sub`: `"Nothing moves until multiple sectors are pushing on the same thing."` / `detail`: `"We find where philanthropy, labor, energy, policy, and culture already overlap — then build campaigns around it."`
- Deep Organizing `sub`: `"Campaigns create momentum. We make sure it lasts."` / `detail`: `"We find the organic leaders on the ground, give them resources, strategy, and amplification, and build movements designed to grow — not just make noise."`

**Section 4 ↔ 6 — Swap Field Notes and Diagnostic CTA positions**
- Move the Field Notes section (currently lines 631-657) ABOVE the Intake CTA section (currently lines 510-578)
- This means proof (Field Notes with real numbers) comes before the ask (Diagnostic CTA)

**Section 5 — Network (lines 580-628)** — Major changes:
- Cut `NETWORK_SECTORS` from 18 items to 9: `"News", "Music", "Film & TV", "Digital Creators", "Sports", "Podcasts & Streaming", "Advertising & Brands", "Tech & Platforms", "Organized Communities"`
- Change heading from `"Our Network"` → keep as section label but update body
- Change body from `"We build with a community of over 400+ practitioners..."` → `"We come from the industries your grantees need to reach."`
- Add sub-body: `"Our team is built from careers in commercial media and entertainment — so we know how these sectors actually work from the inside."`
- Make it a static 3×3 grid with descriptions (matching the doc's card descriptions), NOT interactive/selectable pills
- Each card gets a short description per the doc

**Section 6 — Hero scroll indicator (line ~340-350)**
- Add a subtle scroll indicator (down arrow or "Scroll" text) below "By Referral Only"

**Section 7 — Footer (lines 659-688)**
- Remove the duplicate `"By Referral Only"` text at the bottom. Keep just "Let's Chat →"

### 2. `src/pages/CulturalStrategy.tsx` (line 8)
- Change description to: `"We don't just push your message out. We make sure the right people pick it up — across music, entertainment, news, digital creators, and every cultural sector with reach and influence."`

### 3. `src/pages/CrossSector.tsx` (line 8)
- Change description to: `"Nothing moves until multiple sectors are pushing on the same thing. We find where philanthropy, labor, energy, policy, and culture already overlap — then build campaigns around it."`

### 4. `src/pages/DeepOrganizing.tsx` (line 8)
- Change description to: `"Campaigns create momentum. We make sure it lasts. We find the organic leaders on the ground, give them resources, strategy, and amplification, and build movements designed to grow — not just make noise."`

### 5. `src/pages/Deck.tsx`

**Slide 1 — Intro (lines 557-625)**
- Change heading from `"Let's diagnose your communications."` → `"Find the gaps before your opponents do."`
- Change body from the current two-part text → `"A quick assessment of how your approach compares to the most effective operators in the field — and where you might be leaving leverage on the table."`
- Change button from `"Get started →"` to `"Get Started →"`
- Change time estimate from `"~5 minutes"` → `"~3 minutes"`

**Slide 8 — Sectors (lines 1342-1395)**
- Update heading: already correct (`"We come from the industries your grantees need to reach."`)
- Update body: already has `"Select the ones you're interested in."`
- Add the sub-body line: `"Our team is built from careers in commercial media and entertainment — so we know how these sectors actually work from the inside."`
- Sector cards: Update names and descriptions to match doc exactly:
  - `"News Media"` → `"News"` with desc `"Local and national — how stories get placed and why"`
  - `"Music Industry"` → `"Music"` with desc `"Artists, labels, tours, festivals, venues"`
  - `"Film & TV"` stays, desc `"Production, distribution, cultural impact"`
  - `"Digital Creators"` stays, desc `"Creator economy — where opinion forms now"`
  - `"Sports & Recreation"` → `"Sports"` with desc `"Athletes, leagues, the largest captive audiences"`
  - `"Podcasts & Streaming"` stays, desc `"Long-form audio, gaming, live streaming"` → update to match: `"Long-form audio, gaming, live streaming"` (already matches)
  - `"Advertising & Brands"` stays, desc `"Commercial partnerships at scale"`
  - `"Tech Platforms"` → `"Tech & Platforms"` with desc `"The infrastructure that decides what gets seen"`
  - `"Interest Groups"` → `"Organized Communities"` with desc `"Faith, labor, campuses, veterans, defense"`
- Also update `ALL_SECTORS_LIST` (line 336) to match the new 9 sector names

**Slide 9 — CTA (lines 1396-1478)**
- Heading: already `"Let's talk."` ✓
- Body: already matches ✓
- Button: already `"Submit"` ✓
- Confirmation: already matches ✓

---

## Summary of All Changes

| # | Change | File |
|---|--------|------|
| 1 | "next-generation" → "advanced" | Index.tsx |
| 2 | "portfolio" → "work" in Our Practice | Index.tsx |
| 3 | Fix em-dash/period in body copy | Index.tsx |
| 4 | Replace all 3 capability descriptions | Index.tsx |
| 5 | Swap Field Notes above Diagnostic CTA | Index.tsx |
| 6 | Network: 18→9 sectors, new heading/body, static grid with descriptions | Index.tsx |
| 7 | Add scroll indicator to hero | Index.tsx |
| 8 | Remove duplicate "By Referral Only" from footer | Index.tsx |
| 9 | Update Cultural Strategy description | CulturalStrategy.tsx |
| 10 | Update Cross-Sector description | CrossSector.tsx |
| 11 | Update Deep Organizing description | DeepOrganizing.tsx |
| 12 | Deck intro: new heading, body, time estimate | Deck.tsx |
| 13 | Deck sectors: update card names/descriptions, add sub-body | Deck.tsx |
| 14 | Update ALL_SECTORS_LIST to match new names | Deck.tsx |

No database changes. No new components. Pure copy update across 5 files.

