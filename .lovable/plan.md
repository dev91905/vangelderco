

# The Dek Isn't Disappearing — It Was Never Saved

## What's happening

The database has `excerpt = NULL` for "Reframing Climate Through Cultural Infrastructure." The code fix from earlier (adding the dek input to the editor) is in place and working — but this post was created *before* that fix, so it was saved with `null` and nobody has edited it since.

The code is correct: the editor loads `excerpt`, lets you type it, and saves it. `CaseStudyView` and `PostCard` both render it when present. There's no bug erasing it.

## What to do

**Option A — Just go add it**: Open `/admin`, edit the Reframing Climate post, type the dek in the DEK field, save. Done.

**Option B — Make empty deks impossible to miss** (code change): Add a visual warning in the editor when the dek is empty — a faint red "DEK MISSING" indicator next to the field label so you never accidentally publish without one.

No code changes are needed to fix the missing dek itself — it's a one-time data entry. Option B is a nice guardrail if you want it.

