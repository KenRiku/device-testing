import { Resend } from 'resend'

export async function sendCriticalIssueAlert(params: {
  userEmail: string
  userName: string
  url: string
  scanId: string
  criticalIssueCount: number
  deviceNames: string[]
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log('Resend API key not configured, skipping email')
    return
  }

  const { userEmail, userName, url, scanId, criticalIssueCount, deviceNames } = params

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    await resend.emails.send({
      from: 'PixelProof <alerts@pixelproof.dev>',
      to: [userEmail],
      subject: `⚠️ Critical Issues Detected - ${url}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>PixelProof Alert</title>
            <style>
              body { font-family: 'DM Sans', sans-serif; background: #0f1117; color: #e8eaf6; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; }
              .header { background: #1a1d27; border: 1px solid #2a2d3a; border-radius: 8px; padding: 24px; margin-bottom: 16px; }
              .logo { color: #00d4ff; font-size: 24px; font-weight: 700; margin-bottom: 8px; }
              .alert-badge { background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444; padding: 4px 12px; border-radius: 4px; display: inline-block; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; }
              .content { background: #1a1d27; border: 1px solid #2a2d3a; border-radius: 8px; padding: 24px; margin-bottom: 16px; }
              .issue-count { font-size: 48px; font-weight: 700; color: #ef4444; }
              .url { color: #00d4ff; font-family: monospace; }
              .device-list { background: #242838; border-radius: 4px; padding: 12px 16px; margin: 12px 0; }
              .device-item { color: #8892a4; padding: 4px 0; border-bottom: 1px solid #2a2d3a; }
              .device-item:last-child { border-bottom: none; }
              .cta { background: #00d4ff; color: #0f1117; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block; margin-top: 16px; }
              .footer { color: #8892a4; font-size: 12px; text-align: center; margin-top: 24px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">PixelProof</div>
                <span class="alert-badge">CRITICAL ISSUES DETECTED</span>
              </div>
              <div class="content">
                <p>Hi ${userName},</p>
                <p>A recent scan of <span class="url">${url}</span> has detected critical layout issues across multiple devices.</p>

                <div style="text-align: center; padding: 20px 0;">
                  <div class="issue-count">${criticalIssueCount}</div>
                  <div style="color: #8892a4; margin-top: 4px;">Critical Issues Found</div>
                </div>

                <p><strong>Affected Devices:</strong></p>
                <div class="device-list">
                  ${deviceNames.map(d => `<div class="device-item">• ${d}</div>`).join('')}
                </div>

                <p>These issues may be significantly impacting user experience and conversion rates on your site. We recommend reviewing and addressing them promptly.</p>

                <a href="${process.env.NEXTAUTH_URL || 'https://pixelproof.dev'}/dashboard/scans/${scanId}" class="cta">
                  View Full Report →
                </a>
              </div>
              <div class="footer">
                <p>You're receiving this because you have critical issue alerts enabled for this project.</p>
                <p>© ${new Date().getFullYear()} PixelProof — AI Cross-Device Testing Monitor</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    console.log(`Critical issue alert sent to ${userEmail}`)
  } catch (error) {
    console.error('Error sending email:', error)
  }
}
