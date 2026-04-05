

# Restore Excerpts to Feed Cards

## Problem
All 6 posts have `excerpt = NULL` in the database. The PostCard component correctly renders excerpts when present, but there's nothing to render.

## Fix
Single database migration to `UPDATE` all 6 rows with their original excerpts:

| Post | Excerpt |
|------|---------|
| Reframing Climate Through Cultural Infrastructure | How a coalition of museums, theaters, and civic institutions reshaped public understanding of energy transition in the Mountain West. |
| The Institutional Blind Spot in Cultural Engagement | Why most institutional cultural strategies fail to move opinion — and what a generation of political infrastructure builders got right. |
| Mapping the Seams: Energy, Labor, and National Security Alignment | Identifying the structural points where energy policy, organized labor, and national security interests converge — and where they fracture. |
| Why Cross-Sector Work Fails (And What the Exceptions Have in Common) | Most cross-sector coalitions collapse within 18 months. The ones that survive share three structural traits. |
| Building Power in the Permian Basin | A three-year organizing campaign that constructed durable field infrastructure across five counties in West Texas. |
| Beyond Mobilization: The Case for Organizing Infrastructure | Why turnout-based strategies plateau, and how leadership pipelines and accountability systems compound over time. |

## Technical
- One SQL `UPDATE` statement per row, matched by title
- No schema changes, no code changes

