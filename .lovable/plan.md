

# Lock Down Admin to Invite-Only

## Problem
The login page has a "Create account" toggle that lets anyone sign up and access the admin. This is a security hole — admin should be invite-only, with users created only on the backend.

## Changes

### 1. Remove signup from AdminLogin — `src/pages/AdminLogin.tsx`
- Delete the `isSignUp` state, `signUpSuccess` state, and all signup-related code
- Remove the signup branch from `handleSubmit`
- Remove the "Create account" / "Already have an account?" toggle button
- Remove the signup success confirmation screen
- Keep only the sign-in form: email, password, submit

### 2. Disable self-service signups on the backend
- Use the auth configuration tool to disable signups entirely, so even direct API calls to the auth endpoint can't create accounts
- New users can only be added by you through Lovable Cloud's user management

## Result
Login page becomes sign-in only. No one can create an account through the UI or API. You add admin users manually on the backend when needed.

## Files
- `src/pages/AdminLogin.tsx` — strip all signup code

