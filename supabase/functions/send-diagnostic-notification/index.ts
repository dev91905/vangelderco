import { corsHeaders } from '@supabase/supabase-js/cors'

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.json()
    const {
      recipientEmail,
      firstName, lastName, organization, email,
      readinessScore, selectedPains, selectedDomains,
      quizAnswers, metricsChecked, metricsUnchecked,
      capabilitiesRanked, engagementPath, customChallenge,
      hasMediaExperience, practiceSelections, sectorsNotSelected,
      createdAt,
    } = body

    if (!recipientEmail) {
      return new Response(JSON.stringify({ error: 'recipientEmail required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Format quiz answers for display
    const quizSummary = (quizAnswers || [])
      .map((a: { dimension: string; selectedLabel: string }) =>
        a ? `${a.dimension}: ${a.selectedLabel}` : null
      )
      .filter(Boolean)
      .join('\n    ')

    const painsList = (selectedPains || []).join(', ') || 'None'
    const domainsList = (selectedDomains || []).join(', ') || 'None'
    const metricsList = (metricsChecked || []).join(', ') || 'None'
    const capsList = (capabilitiesRanked || []).join(' → ') || 'None'

    const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; color: #2d2518; background: #faf6f0; padding: 32px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 32px; border: 1px solid #e8e0d4;">
    <h1 style="font-size: 20px; margin: 0 0 24px; color: #2d2518;">New Diagnostic Submission</h1>
    
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr style="border-bottom: 1px solid #e8e0d4;">
        <td style="padding: 8px 0; font-weight: bold; width: 140px;">Name</td>
        <td style="padding: 8px 0;">${firstName} ${lastName}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e8e0d4;">
        <td style="padding: 8px 0; font-weight: bold;">Organization</td>
        <td style="padding: 8px 0;">${organization || '—'}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e8e0d4;">
        <td style="padding: 8px 0; font-weight: bold;">Email</td>
        <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #2d2518;">${email}</a></td>
      </tr>
      <tr style="border-bottom: 1px solid #e8e0d4;">
        <td style="padding: 8px 0; font-weight: bold;">Readiness Score</td>
        <td style="padding: 8px 0; font-size: 18px; font-weight: bold;">${readinessScore ?? '—'}/100</td>
      </tr>
      <tr style="border-bottom: 1px solid #e8e0d4;">
        <td style="padding: 8px 0; font-weight: bold;">Engagement Path</td>
        <td style="padding: 8px 0;">${engagementPath || '—'}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e8e0d4;">
        <td style="padding: 8px 0; font-weight: bold;">Media Experience</td>
        <td style="padding: 8px 0;">${hasMediaExperience === true ? 'Yes' : hasMediaExperience === false ? 'No' : '—'}</td>
      </tr>
    </table>

    <h2 style="font-size: 16px; margin: 24px 0 8px; color: #2d2518;">Pain Points</h2>
    <p style="font-size: 14px; margin: 0; line-height: 1.6;">${painsList}</p>

    <h2 style="font-size: 16px; margin: 24px 0 8px; color: #2d2518;">Selected Sectors</h2>
    <p style="font-size: 14px; margin: 0; line-height: 1.6;">${domainsList}</p>

    ${sectorsNotSelected?.length ? `<h2 style="font-size: 16px; margin: 24px 0 8px; color: #6b6051;">Sectors Not Selected</h2><p style="font-size: 14px; margin: 0; color: #6b6051;">${sectorsNotSelected.join(', ')}</p>` : ''}

    <h2 style="font-size: 16px; margin: 24px 0 8px; color: #2d2518;">Metrics Checked</h2>
    <p style="font-size: 14px; margin: 0; line-height: 1.6;">${metricsList}</p>

    ${metricsUnchecked?.length ? `<h2 style="font-size: 16px; margin: 24px 0 8px; color: #6b6051;">Metrics Unchecked</h2><p style="font-size: 14px; margin: 0; color: #6b6051;">${metricsUnchecked.join(', ')}</p>` : ''}

    <h2 style="font-size: 16px; margin: 24px 0 8px; color: #2d2518;">Capabilities (ranked)</h2>
    <p style="font-size: 14px; margin: 0; line-height: 1.6;">${capsList}</p>

    ${quizSummary ? `<h2 style="font-size: 16px; margin: 24px 0 8px; color: #2d2518;">Quiz Dimensions</h2><pre style="font-size: 13px; margin: 0; line-height: 1.6; white-space: pre-wrap;">${quizSummary}</pre>` : ''}

    ${customChallenge ? `<h2 style="font-size: 16px; margin: 24px 0 8px; color: #2d2518;">Custom Challenge</h2><p style="font-size: 14px; margin: 0; line-height: 1.6;">${customChallenge}</p>` : ''}

    <hr style="border: none; border-top: 1px solid #e8e0d4; margin: 24px 0;" />
    <p style="font-size: 12px; color: #9b917f; margin: 0;">Submitted ${createdAt ? new Date(createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'just now'}</p>
  </div>
</body>
</html>`

    const response = await fetch(`${GATEWAY_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: 'Van Gelder & Co Diagnostic <notifications@vangelderco.com>',
        to: [recipientEmail],
        subject: `Diagnostic: ${firstName} ${lastName}${organization ? ` (${organization})` : ''} — Score ${readinessScore ?? '?'}/100`,
        html: htmlContent,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(`Resend API error [${response.status}]: ${JSON.stringify(data)}`)
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    console.error('Error sending diagnostic notification:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
