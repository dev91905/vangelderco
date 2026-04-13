

## Plan: Email notification when someone submits the diagnostic survey

### What you'll get
After someone completes the diagnostic survey (the deck contact form), you'll receive an email with their name, organization, email, readiness score, and key selections — so you can follow up immediately.

### Steps

1. **Set up email domain** — You'll configure a sender domain through the email setup dialog. This is a one-time step so emails come from your brand (e.g., notify@vangelderco.com).

2. **Set up email infrastructure** — Database tables and queue system for reliable email delivery.

3. **Create notification template** — A clean, on-brand email template containing:
   - Contact name, organization, email
   - Readiness score
   - Selected pain points and sectors
   - Quiz dimension results (advanced vs. conventional)
   - Timestamp

4. **Wire up the trigger** — After the `deck_contacts` insert in `Deck.tsx`, invoke the send function to email you the submission details.

5. **Create unsubscribe page** — Required system page for email compliance.

6. **Deploy edge functions** — Push the email infrastructure live.

### Technical detail

- Template: React Email component in `_shared/transactional-email-templates/`
- Trigger: `supabase.functions.invoke('send-transactional-email', ...)` added after the existing insert in `handleCtaSubmit`
- Recipient: Your email, pulled from `site_settings` (`contact_email` key) so it's admin-configurable
- Idempotency key: `diagnostic-notify-${contactId}` to prevent duplicate sends

