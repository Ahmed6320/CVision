/**
 * CVision Email Templates
 * Used for transactional emails via SendGrid
 */

export const emailTemplates = {
  welcome: (email, name) => ({
    to: email,
    from: 'welcome@cvision.io',
    subject: 'Welcome to CVision - See Your Career Clearly',
    html: `
      <div style="font-family: DM Sans, sans-serif; background: #07070E; color: #EEF0F8; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-family: Cormorant Garamond; font-size: 32px; color: #C9A84C; margin: 0;">
              CV<span style="color: #EEF0F8;">ision</span>
            </h1>
            <p style="color: #6B6B9A; margin: 12px 0 0 0;">See Your Career Clearly</p>
          </div>

          <div style="background: #0E0E1A; border: 1px solid #1C1C2E; border-radius: 12px; padding: 32px;">
            <h2 style="font-size: 24px; margin: 0 0 16px 0;">Welcome, ${name}!</h2>
            
            <p style="color: #6B6B9A; line-height: 1.6; margin: 16px 0;">
              We're excited to have you join CVision. Start building your stunning CV in minutes with AI assistance and professional templates.
            </p>

            <h3 style="font-size: 18px; margin: 24px 0 16px 0;">Getting Started:</h3>
            <ol style="color: #6B6B9A; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Sign in to your account</li>
              <li>Create a new CV</li>
              <li>Use AI Writer or manual builder</li>
              <li>Choose from 20 professional templates</li>
              <li>Download your CV as PDF</li>
            </ol>

            <div style="margin-top: 32px; text-align: center;">
              <a href="https://cvision.io/builder" style="display: inline-block; background: linear-gradient(135deg, #C9A84C, #E8C96A); color: #07070E; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Start Building Your CV
              </a>
            </div>
          </div>

          <div style="margin-top: 32px; text-align: center; color: #6B6B9A; font-size: 12px;">
            <p style="margin: 0;">Questions? Reply to this email or visit our help center.</p>
            <p style="margin: 8px 0 0 0;">© 2026 CVision. All rights reserved.</p>
          </div>
        </div>
      </div>
    `,
  }),

  paymentSuccess: (email, name, plan, amount, invoiceId) => ({
    to: email,
    from: 'billing@cvision.io',
    subject: `Payment Received - ${plan.toUpperCase()} Plan`,
    html: `
      <div style="font-family: DM Sans, sans-serif; background: #07070E; color: #EEF0F8; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="background: #0E0E1A; border: 1px solid #1C1C2E; border-radius: 12px; padding: 32px;">
            <div style="display: flex; align-items: center; margin-bottom: 24px;">
              <span style="font-size: 28px; margin-right: 12px;">✓</span>
              <h2 style="margin: 0; font-size: 24px;">Payment Successful</h2>
            </div>

            <p style="color: #6B6B9A; line-height: 1.6; margin: 0 0 24px 0;">
              Thank you, ${name}! Your payment has been processed successfully.
            </p>

            <div style="background: #13131F; border: 1px solid #1C1C2E; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #1C1C2E;">
                <span style="color: #6B6B9A;">Plan</span>
                <span style="font-weight: 600;">${plan.charAt(0).toUpperCase() + plan.slice(1)}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6B6B9A;">Amount</span>
                <span style="font-weight: 600; color: #4ADE80;">$${amount.toFixed(2)}</span>
              </div>
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #1C1C2E; display: flex; justify-content: space-between;">
                <span style="color: #6B6B9A; font-size: 12px;">Invoice ID</span>
                <span style="font-size: 12px; color: #6B6B9A;">${invoiceId}</span>
              </div>
            </div>

            <h3 style="font-size: 16px; margin: 24px 0 12px 0;">Your New Features:</h3>
            <ul style="color: #6B6B9A; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>✓ 20 Professional Templates</li>
              <li>✓ AI CV Writer & Analysis</li>
              <li>✓ Job Matching Tool</li>
              <li>✓ Cover Letter Generator</li>
              <li>✓ Dark Mode & Custom Colors</li>
              <li>✓ Clean PDF Downloads</li>
            </ul>

            <div style="margin-top: 32px; text-align: center;">
              <a href="https://cvision.io/dashboard" style="display: inline-block; background: linear-gradient(135deg, #C9A84C, #E8C96A); color: #07070E; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Go to Dashboard
              </a>
            </div>
          </div>

          <div style="margin-top: 32px; text-align: center; color: #6B6B9A; font-size: 12px;">
            <p style="margin: 0;">Download your invoice from your billing page.</p>
            <p style="margin: 8px 0 0 0;">© 2026 CVision. All rights reserved.</p>
          </div>
        </div>
      </div>
    `,
  }),

  resetPassword: (email, resetLink, name) => ({
    to: email,
    from: 'security@cvision.io',
    subject: 'Reset Your CVision Password',
    html: `
      <div style="font-family: DM Sans, sans-serif; background: #07070E; color: #EEF0F8; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="background: #0E0E1A; border: 1px solid #1C1C2E; border-radius: 12px; padding: 32px;">
            <h2 style="margin: 0 0 16px 0; font-size: 24px;">Reset Your Password</h2>
            
            <p style="color: #6B6B9A; line-height: 1.6; margin: 16px 0;">
              Hi ${name},
            </p>

            <p style="color: #6B6B9A; line-height: 1.6; margin: 0 0 24px 0;">
              We received a request to reset your password. Click the button below to create a new password.
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #C9A84C, #E8C96A); color: #07070E; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Reset Password
              </a>
            </div>

            <p style="color: #6B6B9A; font-size: 12px; margin: 24px 0 0 0; line-height: 1.6;">
              This link expires in 24 hours. If you didn't request a password reset, ignore this email.
            </p>

            <p style="color: #6B6B9A; font-size: 12px; margin: 16px 0 0 0; line-height: 1.6; word-break: break-all;">
              Or copy this link: <br><span style="color: #5B8DEF;">${resetLink}</span>
            </p>
          </div>

          <div style="margin-top: 32px; text-align: center; color: #6B6B9A; font-size: 12px;">
            <p style="margin: 0;">© 2026 CVision. All rights reserved.</p>
          </div>
        </div>
      </div>
    `,
  }),

  cvScoreNotification: (email, name, score, grade, atsScore) => ({
    to: email,
    from: 'notifications@cvision.io',
    subject: `Your CV Score: ${grade} (${score}/100)`,
    html: `
      <div style="font-family: DM Sans, sans-serif; background: #07070E; color: #EEF0F8; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="background: #0E0E1A; border: 1px solid #1C1C2E; border-radius: 12px; padding: 32px;">
            <h2 style="margin: 0 0 24px 0; font-size: 24px;">Your CV Analysis is Ready</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0;">
              <div style="background: #13131F; border: 1px solid #1C1C2E; border-radius: 8px; padding: 20px; text-align: center;">
                <div style="font-size: 28px; font-weight: 700; color: #C9A84C; margin-bottom: 8px;">${score}</div>
                <div style="color: #6B6B9A; font-size: 12px;">Overall Score</div>
              </div>
              <div style="background: #13131F; border: 1px solid #1C1C2E; border-radius: 8px; padding: 20px; text-align: center;">
                <div style="font-size: 28px; font-weight: 700; color: #4ADE80; margin-bottom: 8px;">${grade}</div>
                <div style="color: #6B6B9A; font-size: 12px;">Grade</div>
              </div>
            </div>

            <div style="background: #13131F; border: 1px solid #1C1C2E; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <div style="font-weight: 600; margin-bottom: 8px;">ATS Compatibility</div>
              <div style="background: #0E0E1A; border-radius: 4px; height: 8px; overflow: hidden;">
                <div style="background: #5B8DEF; height: 100%; width: ${atsScore}%;"></div>
              </div>
              <div style="color: #6B6B9A; font-size: 12px; margin-top: 8px;">${atsScore}/100 - Excellent match for ATS systems</div>
            </div>

            <p style="color: #6B6B9A; line-height: 1.6; margin: 24px 0;">
              Your CV is performing well! Review the detailed analysis in your dashboard to see specific recommendations for improvement.
            </p>

            <div style="text-align: center; margin-top: 32px;">
              <a href="https://cvision.io/ai/score" style="display: inline-block; background: linear-gradient(135deg, #C9A84C, #E8C96A); color: #07070E; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                View Full Analysis
              </a>
            </div>
          </div>

          <div style="margin-top: 32px; text-align: center; color: #6B6B9A; font-size: 12px;">
            <p style="margin: 0;">© 2026 CVision. All rights reserved.</p>
          </div>
        </div>
      </div>
    `,
  }),

  jobMatchAlert: (email, name, jobTitle, company, matchScore) => ({
    to: email,
    from: 'notifications@cvision.io',
    subject: `Perfect Match Found: ${jobTitle} at ${company}`,
    html: `
      <div style="font-family: DM Sans, sans-serif; background: #07070E; color: #EEF0F8; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="background: #0E0E1A; border: 1px solid #1C1C2E; border-radius: 12px; padding: 32px;">
            <h2 style="margin: 0 0 24px 0; font-size: 24px;">We Found a Great Match!</h2>
            
            <div style="background: #13131F; border: 1px solid #1C1C2E; border-radius: 8px; padding: 24px; margin: 24px 0;">
              <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">${jobTitle}</div>
              <div style="color: #6B6B9A; margin-bottom: 16px;">${company}</div>
              
              <div style="display: flex; align-items: center; gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #1C1C2E;">
                <span style="font-size: 24px; font-weight: 700; color: #4ADE80;">${matchScore}%</span>
                <span style="color: #6B6B9A;">Match Score</span>
              </div>
            </div>

            <p style="color: #6B6B9A; line-height: 1.6; margin: 24px 0;">
              Your CV has a ${matchScore}% match with this position. This means you have most of the skills and experience the employer is looking for!
            </p>

            <div style="text-align: center; margin-top: 32px;">
              <a href="https://cvision.io/ai/match" style="display: inline-block; background: linear-gradient(135deg, #4ADE80, #22c55e); color: #07070E; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                View Matching Keywords
              </a>
            </div>
          </div>

          <div style="margin-top: 32px; text-align: center; color: #6B6B9A; font-size: 12px;">
            <p style="margin: 0;">© 2026 CVision. All rights reserved.</p>
          </div>
        </div>
      </div>
    `,
  }),

  upgradeReminder: (email, name, plan, upgrade) => ({
    to: email,
    from: 'marketing@cvision.io',
    subject: `Unlock ${upgrade} Features - Special Offer Inside`,
    html: `
      <div style="font-family: DM Sans, sans-serif; background: #07070E; color: #EEF0F8; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="background: #0E0E1A; border: 1px solid #1C1C2E; border-radius: 12px; padding: 32px;">
            <h2 style="margin: 0 0 16px 0; font-size: 24px;">Ready for More?</h2>
            
            <p style="color: #6B6B9A; line-height: 1.6; margin: 16px 0;">
              Hi ${name}, you're doing great with your ${plan} plan! Unlock powerful features designed to land more interviews.
            </p>

            <div style="background: #13131F; border: 1px solid #1C1C2E; border-radius: 8px; padding: 24px; margin: 24px 0;">
              <h3 style="margin: 0 0 16px 0;">Unlock Today:</h3>
              <ul style="color: #6B6B9A; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>✓ AI Cover Letter Generator</li>
                <li>✓ Advanced Job Matching</li>
                <li>✓ Dark Mode & Custom Colors</li>
                <li>✓ Priority Support</li>
              </ul>
            </div>

            <div style="background: #13131F; border: 2px solid #C9A84C; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
              <div style="color: #C9A84C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Limited Time</div>
              <div style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Save 20%</div>
              <div style="color: #6B6B9A;">Use code: UPGRADE20</div>
            </div>

            <div style="text-align: center; margin-top: 32px;">
              <a href="https://cvision.io/pricing" style="display: inline-block; background: linear-gradient(135deg, #C9A84C, #E8C96A); color: #07070E; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Upgrade Now
              </a>
            </div>
          </div>

          <div style="margin-top: 32px; text-align: center; color: #6B6B9A; font-size: 12px;">
            <p style="margin: 0;">© 2026 CVision. All rights reserved.</p>
          </div>
        </div>
      </div>
    `,
  }),
};

/**
 * Send email using SendGrid
 * Usage: await sendEmail(templates.welcome(email, name))
 */
export async function sendEmail(emailData) {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: emailData.to }] }],
        from: { email: emailData.from },
        subject: emailData.subject,
        content: [{ type: 'text/html', value: emailData.html }],
      }),
    });

    if (!response.ok) {
      throw new Error(`SendGrid error: ${response.status}`);
    }

    return { success: true, messageId: response.headers.get('X-Message-Id') };
  } catch (error) {
    console.error('Email send failed:', error);
    return { success: false, error: error.message };
  }
}
