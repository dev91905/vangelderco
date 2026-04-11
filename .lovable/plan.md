

## Replace "Mark as sent" with "Send as email" — mailto with HTML report body

### What it does

Replaces the "Mark as sent" button with "Send as email". Clicking it builds a beautifully formatted HTML version of the diagnostic report, opens the user's default email client via `mailto:` with the contact's email pre-filled, the subject line set, and the report body pasted in. After opening, it auto-marks the contact as "sent".

### The challenge with mailto

`mailto:` links only support plain text bodies — no HTML rendering. Email clients strip HTML tags from mailto body params. So we have two options:

1. **Copy rich HTML to clipboard + open mailto** — The button copies the formatted report HTML to the clipboard (so you can paste it into your email client's compose window) and simultaneously opens a `mailto:` with subject pre-filled and a plain-text fallback body. You paste from clipboard to get the beautiful version.

2. **Plain text only via mailto** — Structure the report as clean plain text with good formatting (headers, bullets, dashes) that looks professional in any email client. No rich formatting.

Option 1 gives you the gorgeous HTML but requires a paste step. Option 2 is zero-friction but plain text only.

### Recommended approach: Option 1 (clipboard HTML + mailto)

**`src/pages/AdminSubmissions.tsx`**

1. **Add `buildEmailHtml(data: DiagnosticData)` function** — Generates a standalone HTML email string with inline styles (table-based layout for email client compatibility). Includes the score ring as a styled number, dimension assessment as colored bars/text, gap cards, measurement gaps grid, priority practices pills, and CTA buttons. All inline-styled for Gmail/Outlook/Apple Mail compatibility.

2. **Replace `markAsSent` button handler** — New `handleSendEmail` function that:
   - Builds the HTML string from `reportData`
   - Creates a `ClipboardItem` with `text/html` MIME type and copies to clipboard
   - Opens `mailto:${contact.email}?subject=Your Strategic Diagnostic — Van Gelder & Co&body=(see clipboard)` 
   - Shows a toast: "Report copied to clipboard — paste into your email"
   - Auto-marks contact as "sent"

3. **Update button UI** — Change label from "Mark as sent" to "Send as email", keep the Mail icon. After sending, show "Sent ✓" state same as before.

### The HTML email template

The `buildEmailHtml` function will produce a self-contained HTML email with:
- Table-based layout (not flexbox/grid — email clients don't support those)
- Inline styles throughout
- Score displayed as a large styled number with colored label (no SVG ring — email clients butcher SVGs)
- Dimension results as text rows with colored status indicators
- Gap cards with orange accent dots
- Measurement gaps as two-column table (tracked vs missing)
- Priority practices as inline-block pills
- CTA section with styled link buttons
- Professional header with name, org, date

### Files changed

- **`src/pages/AdminSubmissions.tsx`** — Add `buildEmailHtml()`, replace mark-as-sent button with send-as-email button, update handler logic

No other files change. No new dependencies.

