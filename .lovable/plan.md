

# Add Admin Authentication (Email & Password)

## Summary
Protect all `/admin` routes behind email/password login. One account is created via signup, then used to log in. No profile table needed — just Supabase auth.

## Changes

### 1. `src/pages/AdminLogin.tsx` — New file
Login page matching the site's brutalist aesthetic:
- Email + password inputs, "Sign In" button
- Small "Create account" toggle that reveals a signup form (same page, not a separate route)
- After successful auth, redirect to `/admin`
- Uses `supabase.auth.signInWithPassword()` and `supabase.auth.signUp()`
- Error states inline, no modals
- Same near-black background, JetBrains Mono, red accent as the rest of admin

### 2. `src/components/admin/RequireAuth.tsx` — New file
Wrapper component that:
- Listens to `supabase.auth.onAuthStateChange()` + calls `getSession()` on mount
- If authenticated → renders children
- If not → redirects to `/admin/login`
- Shows a minimal loading state while checking session

### 3. `src/App.tsx` — Route updates
- Add `/admin/login` route → `AdminLogin`
- Wrap the three admin routes (`/admin`, `/admin/new`, `/admin/edit/:id`) with `RequireAuth`

### 4. `src/pages/Admin.tsx` — Add sign-out
- Add a "Sign Out" button in the header bar (next to the Settings gear)
- Calls `supabase.auth.signOut()` then navigates to `/admin/login`

### 5. Security scan findings
- The two scan findings about exposed passwords in `capability_posts` and `site_settings` are already addressed by the earlier security fix (edge function verification, column exclusion from public queries). The RLS policies already restrict write access to authenticated users. Adding auth completes the picture — only logged-in admins can reach the management UI.

### No database changes
Supabase auth is built-in. No profiles table needed (user confirmed). No new migrations.

