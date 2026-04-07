

# Revamp Pitch Deck — Sharper, Richer, Acquisition-Optimized

## Strategic Reframe

The deck currently reads like a general capabilities overview. Based on your description, the audience is a **donor advisor who already spends on comms** (Berlin Rosen, Climate Power, paid media) and feels like it's not working but doesn't know why. The deck needs to:

1. Name the problem they're already feeling (your tools are broken and the other side is outpacing you)
2. Show them what they're missing (not better ads — a fundamentally different approach)
3. Make it feel learnable, not intimidating ("you'll be able to do this yourself")

## Revised Frame Structure (13 frames)

**Frame 1 — Title**
"Van Gelder Co." + new tagline: "Strategic advisory for the people trying to move something that matters." (Pulled from the outline — better than current tagline for a donor advisor audience.)

**Frame 2 — The Problem**
Completely rewritten. Not abstract ("infrastructure is broken") — concrete and visceral:
- "You're spending millions on paid media, op-eds, and documentaries nobody watches."
- Facebook counts a 3-second scroll as a view. You get inflated numbers back and wonder why nothing moved.
- You're testing messages in a test tube, then paying people to watch them.
- The tools aren't broken. They're just the wrong tools.

**Frame 3 — Meanwhile** (NEW)
What the other side is doing while you run Facebook ads:
- Buying the platforms you advertise on and changing the algorithms
- Investing in investigative news and digital creator economies
- Running public polls that shift policy baselines
- Developing new media talent, then acquiring legacy platforms
- They don't test in a test tube — they throw money everywhere, see what sticks organically, and supercharge it.

This frame creates urgency. It's the "oh shit" moment.

**Frame 4 — What We Do**
One sentence: "We sit at the intersection of philanthropy, policy, labor, culture, and technology — and we build the connective tissue between them." Minimal three-node visual. Three capabilities named.

**Frame 5 — Cultural Strategy** (Domain 001)
Expanded description naming the actual sectors: music industry, local and national news, digital creators, brands and advertisers, social platforms, film and TV, faith institutions, veterans groups, athletes, college campuses. "Anywhere people gather around an interest that has nothing to do with politics." We find where those intersect with institutional power and design coordinated interventions. Pull-quote: "Culture doesn't support the strategy. Culture IS the strategy." Keep mock case example and stat chips.

**Frame 6 — Cross-Sector Intelligence** (Domain 002)
Reframed for the donor advisor: "Even the best donor advisors struggle with multi-sector organizing. How does a philanthropic dollar unlock community foundations, national security, public utilities, policy, other donors, culture, and labor — simultaneously? It's a lot to hold in one's head." We build the processes, coalitions, and tools that make it visible and manageable. Pull-quote: "Know first. Move first." Keep mock case and stats.

**Frame 7 — Deep Organizing** (Domain 003)
Reframed around durability: "You're used to mass mobilization — turning out the same people over and over without growing the movement. The question every donor is asking now: am I building durable power, or funding something that fizzles in four years?" We find the organic leaders who already have trust and momentum, audit and develop groups, do landscape analysis, and scale what works. Pull-quote: "Not events. Not 'engagement.' Organizing." Keep mock case and stats.

**Frame 8 — The Loop** (replaces "The System")
SVG circular flow diagram: Intelligence → Cultural Strategy → Deep Organizing → back to Intelligence. "Intelligence tells you where to aim. Culture tells you how to move people. Organizing makes it stick." Subtext: "It's a loop, not a menu." (From the outline — this is the single most important visual.)

**Frame 9 — What You Get** (NEW)
Concrete deliverables, not abstractions. Styled as a minimal grid/list:
- **Strategy Audit** — We look at your current portfolio, analyze what's working and what's not, identify gaps and opportunities.
- **Partnership Development** — Introductions to strategic partners and potential grantees your network hasn't surfaced.
- **Program Design & Management** — If something's missing, we build it and run it with you.
- **Intelligence Feed** — Ongoing cross-sector briefings so you're never operating on an incomplete map.
- **Comms Support** — Day-to-day material production, internal and external communications.

**Frame 10 — Origin Story**
The three-gap framing (from the outline — much stronger than current "$500M" version):
- The donors had money but no map.
- The policy people had maps but no people.  
- The culture people had people but no strategy.
- Everyone was operating with a piece of the picture. Nobody had the whole thing.
- "We built the connective tissue."

**Frame 11 — The Promise** (NEW)
The key acquisition message you described: "You'll learn everything we know. This isn't some black box you'll depend on forever. Work with us and you'll understand multi-sector strategy deeply enough to run it yourself. We're building your capacity, not your dependency." This is the closer before the timeline — it resolves the "am I just hiring another vendor?" anxiety.

**Frame 12 — First 90 Days**
Keep the existing timeline visualization exactly as-is.

**Frame 13 — Close**
"By referral only." Keep minimal.

## Technical Details

### File: `src/pages/Deck.tsx`
- Update `TOTAL_FRAMES` from 9 to 13
- Add 4 new frames (Meanwhile, What You Get, The Promise, plus What We Do which replaces nothing)
- Rewrite Problem, Cultural Strategy, Cross-Sector, Deep Organizing, Origin Story frame content
- Replace "The System" frame with The Loop (SVG circular diagram)
- Add `DeliverableRow` inline component for the What You Get frame
- Keep `StatChip`, `TimelineStep` components as-is
- Keep all mock case examples and stat chips on domain frames

### No other files change.

