

# Generate Filler Content for Capability Pages

Insert sample case studies and blog posts into the `capability_posts` table for all three capabilities. 6 posts total — 2 per capability (one case study, one blog post), all published.

## Content

**Cultural Strategy:**
1. Case Study — "Reframing Climate Through Cultural Infrastructure" — How a coalition of museums, theaters, and faith institutions shifted public narrative on energy transition in the Rust Belt.
2. Blog Post — "The Institutional Blind Spot in Cultural Engagement" — Why most policy organizations fail to treat culture as a strategic lever, and what changes when they do.

**Cross-Sector Intelligence:**
1. Case Study — "Mapping the Seams: Energy, Labor, and National Security Alignment" — A coordinated strategy across three sectors that unlocked $200M in aligned capital deployment.
2. Blog Post — "Why Cross-Sector Work Fails (And What the Exceptions Have in Common)" — The structural reasons most coalition efforts collapse, and the connective tissue that sustains the ones that don't.

**Deep Organizing:**
1. Case Study — "Building Power in the Permian Basin" — A three-year organizing campaign that constructed durable field infrastructure across five counties.
2. Blog Post — "Beyond Mobilization: The Case for Organizing Infrastructure" — Why turnout-based strategies plateau, and how leadership pipelines and accountability systems compound over time.

## Technical
- Single `psql` INSERT of 6 rows into `capability_posts`
- All with `is_published = true` and staggered `published_at` dates
- Excerpts ~1-2 sentences, content ~2-3 paragraphs each

