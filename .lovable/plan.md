

# Growth Audit: Anchor "Communications" Everywhere

## The Problem
A prospect scrolling the site sees: "Cultural Strategy," "Cross-Sector Intelligence," "Deep Organizing," "Our Altitude," "Our Network," "Field Notes." The word **communications** appears exactly once in the Altitude body copy and once buried in a capability card detail paragraph. A $100M donor scanning this site has no idea this is a communications firm. They think it's a strategy consultancy, an organizing shop, or a think tank.

The deck is worse — 12 frames, the word "communications" appears once (in the quiz row for "Content"). The hero says "Let's figure out if there's a fit." Fit for what? Communications advisory? Political consulting? Management consulting?

## Copy Changes — Every Section Gets "Communications"

### Homepage (`src/pages/Index.tsx`)

| Section | Current | Proposed |
|---------|---------|----------|
| **Hero subtitle** (below the 3 nav links) | No subtitle — just 6 sector pills | Add a one-line descriptor above the pills: **"Strategic Communications Advisory"** |
| **Altitude label** | "Our Altitude" | **"Our Approach to Communications"** |
| **Altitude serif line 1** | "You're on the ground doing the work." | **"Your communications are on the ground. We see them from orbit."** |
| **Altitude serif line 2** | "We see the field from orbit." | **"One picture. Every sector. Every gap."** |
| **Altitude body** | "Six sectors. One picture. We identify alignment..." | **"We identify the communications alignment that nobody in any single sector can see from where they sit."** |
| **Altitude body p2** | "We're specialists in cultural strategy, media-based organizing, and philanthropy..." | **"We're strategic communications specialists — cultural strategy, media-based organizing, and cross-sector coordination — helping donors and their grantees close the gap between spend and impact."** |
| **Capabilities label** | "Capabilities" | **"Communications Capabilities"** |
| **Cap 1 tagline** | "Communications is the floor. Uptake is the ceiling." | **"Strategic communications that become cultural moments."** |
| **Cap 2 tagline** | "Nothing moves unless multiple sectors push together." | **"Communications coordinated across every sector that matters."** |
| **Cap 3 tagline** | "Not mobilization. Recruitment and retention." | **"Communications infrastructure that grows your base."** |
| **Intake CTA chip** | "Strategic Diagnostic" | **"Communications Diagnostic"** |
| **Intake CTA subhead** | "A short diagnostic that benchmarks your communications strategy against the opposition..." | Keep — already has "communications" ✓ |
| **Network label** | "Our Network" | **"Our Communications Network"** |
| **Network body** | "We collaborate with a network of over 400 practitioners across every sector that moves policy, culture, and capital." | **"Over 400 communications practitioners across every sector that moves policy, culture, and capital."** |
| **Footer** | Just email + "By Referral Only" | Add: **"Strategic Communications Advisory · Van Gelder Co."** above email |

### Deck (`src/pages/Deck.tsx`)

| Frame | Current | Proposed |
|-------|---------|----------|
| **Frame 1 hero** | "Let's figure out if there's a fit." | **"Let's diagnose your communications."** |
| **Frame 1 body** | "This is a five-minute walkthrough that helps us understand your situation..." | **"A five-minute diagnostic that benchmarks your strategic communications against the other side — and shows you exactly where the gaps are."** |
| **Frame 1 time label** | "5 min · interactive diagnostic" | **"5 min · communications diagnostic"** |
| **Frame 2 heading** | "Tell us where you are." | **"Where are your communications right now?"** |
| **Frame 3 subhead** | "Two approaches to {dimension}. Pick whichever you think works better." | **"Two communications approaches to {dimension}. Pick the one you think works better."** |
| **Frame 4 heading** | "Here's what separates portfolios that move policy from ones that report on awareness." | **"Here's what separates communications that move policy from ones that report on awareness."** |
| **Frame 5 heading** | "Where do you need the most help?" | **"Where do your communications need the most help?"** |
| **Frame 7 heading** | "Which of these do you currently track?" | **"How do you measure your communications today?"** |
| **Frame 8 heading** | "How do you want to start?" | **"How do you want to start working on your communications?"** |
| **Frame 9 heading** | "We've been where you are." | **"We've built the communications you're trying to buy."** |
| **Frame 10 heading** | "We've got a picture. Let's talk." | **"We've got a picture of your communications. Let's talk."** |
| **Frame 11 heading** | "Selected case work." | **"Selected communications work."** |
| **Frame 12 button** | "Send your intake →" | **"Send your communications intake →"** |

### Capability Pages

| Page | Current Title | Proposed |
|------|--------------|----------|
| **CulturalStrategy.tsx** | "Cultural Strategy" | Keep title, update description: add "communications" — **"...turning strategic communications into cultural moments."** |
| **CrossSector.tsx** | "Cross-Sector Intelligence" | Update description: **"We map the communications alignments that nobody in any single sector can see."** |
| **DeepOrganizing.tsx** | "Deep Organizing" | Update description: **"...sustaining their participation over time. That's the difference between communications that grow a movement and ones that stall."** |

### Meta/SEO (`index.html`)

| Current | Proposed |
|---------|----------|
| `<title>VGC StratComm Advisors</title>` | **`<title>Van Gelder Co. · Strategic Communications Advisory</title>`** |
| `<meta name="description" content="Strategic communications advisory. By referral only.">` | Keep ✓ |

## Additional Growth Recommendations

1. **Add a persistent tagline to the header** — The top-right "Van Gelder Co." label should include "Strategic Communications" beneath it in smaller type. Every scroll position should reinforce what you do.

2. **Capability card CTAs should say what they are** — "Explore →" tells me nothing. Change to "Explore Communications Capability →" or just "See how we do it →".

3. **The "By Referral Only" tag is a growth killer in isolation** — It signals exclusivity, but without context it just tells cold traffic "you can't use this." Add context: "By Referral Only · Request an introduction" with a mailto link.

## Files to change
| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Copy updates across Hero, Altitude, Capabilities, Intake CTA, Network, Footer sections + header tagline |
| `src/pages/Deck.tsx` | Copy updates across all 12 frames |
| `src/pages/CulturalStrategy.tsx` | Description copy |
| `src/pages/CrossSector.tsx` | Description copy |
| `src/pages/DeepOrganizing.tsx` | Description copy |
| `index.html` | Title tag update |

