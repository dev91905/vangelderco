

## Fix: Diagnostic notification email not sending

### Root cause

The notification depends on `siteSettings?.contact_email` being loaded client-side before the user submits. If the site settings query hasn't resolved yet (race condition), or if the user submitted from the published site before the latest code was deployed, `notifyEmail` is `undefined` and the entire notification block is silently skipped. Zero edge function logs confirm the function was never invoked.

### Fix

1. **Remove dependency on client-side settings** — Hardcode the recipient email directly in the edge function instead of passing it from the client. The edge function will read `contact_email` from the `site_settings` table server-side using the service role key. This eliminates the race condition entirely.

2. **Always invoke the edge function** — Remove the `if (notifyEmail)` guard in `Diagnostic.tsx`. The function will always be called after a successful insert, and the edge function itself will look up the recipient.

3. **Add console logging** — Add a `console.warn` if the invocation fails so future issues are visible in the browser console.

### Files changed

- **`supabase/functions/send-diagnostic-notification/index.ts`** — Add Supabase client initialization with service role key. Read `contact_email` from `site_settings` table. If no recipient is configured, return early with a logged warning. Remove `recipientEmail` from the required request body.

- **`src/pages/Diagnostic.tsx`** — Remove the `if (notifyEmail)` guard. Always invoke `send-diagnostic-notification` after insert. Remove `recipientEmail` from the body. Add `.catch` with `console.warn`.

- **Redeploy** the edge function after changes.

### Why this is better

The notification is no longer dependent on a client-side query resolving before submit. The edge function owns its own recipient lookup, making it reliable regardless of client state, page load timing, or which version of the frontend the user is on.

