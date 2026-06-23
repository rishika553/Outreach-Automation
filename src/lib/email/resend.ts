import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
}

export interface SendEmailResult {
  success: boolean
  id?: string
  error?: string
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: params.from || 'onboarding@resend.dev',
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error occurred' 
    }
  }
}

export async function sendBulkEmails(
  emails: Array<SendEmailParams>
): Promise<Array<SendEmailResult & { to: string }>> {
  const results = await Promise.all(
    emails.map(async (email) => {
      const result = await sendEmail(email)
      return { ...result, to: email.to }
    })
  )
  return results
}

export function generateEmailHTML(body: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #ffffff; padding: 20px;">
    ${body.split('\n').map(line => `<p style="margin: 0 0 16px 0;">${line}</p>`).join('')}
  </div>
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
    <p>You received this email because you were contacted through our outreach platform.</p>
    <p>If you'd like to unsubscribe, please reply with "UNSUBSCRIBE" in the subject line.</p>
  </div>
</body>
</html>
  `.trim()
}

export function generateTextVersion(body: string): string {
  return `${body}

---
You received this email because you were contacted through our outreach platform.
If you'd like to unsubscribe, please reply with "UNSUBSCRIBE" in the subject line.`
}
