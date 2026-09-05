import { Resend } from 'resend';

interface SendVerificationEmailOptions {
  email: string;
  verificationUrl: string;
}

interface SendPasswordResetEmailOptions {
  email: string;
  resetUrl: string;
}

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

/**
 * Send email verification link using Resend API
 */
export async function sendVerificationEmail({
  email,
  verificationUrl,
}: SendVerificationEmailOptions): Promise<{ success: boolean; error?: string }> {
  const fromEmail = process.env.EMAIL_FROM || 'GGResume <noreply@ggresume.com>';
  const subject = 'Verify your email address - GGResume';

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Verify your email address</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 32px 16px;
      color: #0f172a;
    }
    .container {
      max-width: 540px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 40px 32px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    }
    .brand {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0f172a;
      margin-bottom: 24px;
    }
    .brand span {
      color: #475569;
      font-weight: 600;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
      line-height: 1.3;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin: 0 0 20px 0;
    }
    .button-wrap {
      margin: 28px 0;
      text-align: center;
    }
    .btn {
      display: inline-block;
      background-color: #0f172a;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      padding: 12px 28px;
      border-radius: 10px;
    }
    .footnote {
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
      margin-top: 32px;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">GG<span>Resume</span></div>
    <h1>Verify your email address</h1>
    <p>Thanks for signing up for GGResume! Please verify your email address (<strong>${email}</strong>) to get started with creating ATS-optimized resumes.</p>
    
    <div class="button-wrap">
      <a href="${verificationUrl}" target="_blank" class="btn">Verify Email Address</a>
    </div>

    <p style="font-size: 13px;">This verification link will expire in 24 hours. If you did not create an account, you can safely ignore this email.</p>

    <div class="footnote">
      <p>If the button above doesn't work, copy and paste this link into your browser:</p>
      <a href="${verificationUrl}" style="color: #64748b;">${verificationUrl}</a>
    </div>
  </div>
</body>
</html>
`;

  const textContent = `
Verify your email address - GGResume

Thanks for signing up for GGResume! Please verify your email address to get started:
${verificationUrl}

This link will expire in 24 hours. If you did not create an account, please ignore this email.
`;

  const resend = getResendClient();

  if (resend) {
    try {
      const result = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject,
        html: htmlContent,
        text: textContent,
      });

      if (result.error) {
        console.error('Resend API error:', result.error);
        return { success: false, error: result.error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.error('Failed to send email via Resend:', err);
      return { success: false, error: err.message || 'Resend delivery failed' };
    }
  }

  // Fallback / Dev Mode output when RESEND_API_KEY is not configured
  console.log('\n================== [GGResume Verification Email (Resend API)] ==================');
  console.log(`To: ${email}`);
  console.log(`From: ${fromEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`Verification URL: ${verificationUrl}`);
  console.log('Note: To send real emails, set RESEND_API_KEY in your environment variables.');
  console.log('=================================================================================\n');

  return { success: true };
}

/**
 * Send password reset link using Resend API
 */
export async function sendPasswordResetEmail({
  email,
  resetUrl,
}: SendPasswordResetEmailOptions): Promise<{ success: boolean; error?: string }> {
  const fromEmail = process.env.EMAIL_FROM || 'GGResume <noreply@ggresume.com>';
  const subject = 'Reset your GGResume password';

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Reset your password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 32px 16px;
      color: #0f172a;
    }
    .container {
      max-width: 540px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 40px 32px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    }
    .brand {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0f172a;
      margin-bottom: 24px;
    }
    .brand span {
      color: #475569;
      font-weight: 600;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
      line-height: 1.3;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin: 0 0 20px 0;
    }
    .button-wrap {
      margin: 28px 0;
      text-align: center;
    }
    .btn {
      display: inline-block;
      background-color: #0f172a;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      padding: 12px 28px;
      border-radius: 10px;
    }
    .footnote {
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
      margin-top: 32px;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">GG<span>Resume</span></div>
    <h1>Reset your password</h1>
    <p>We received a request to reset the password for your GGResume account (<strong>${email}</strong>). Click the button below to set a new password:</p>
    
    <div class="button-wrap">
      <a href="${resetUrl}" target="_blank" class="btn">Reset Password</a>
    </div>

    <p style="font-size: 13px;">This link is valid for 1 hour. If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.</p>

    <div class="footnote">
      <p>If the button above doesn't work, copy and paste this link into your browser:</p>
      <a href="${resetUrl}" style="color: #64748b;">${resetUrl}</a>
    </div>
  </div>
</body>
</html>
`;

  const textContent = `
Reset your GGResume password

We received a request to reset the password for your GGResume account (${email}). Follow the link below to set a new password:
${resetUrl}

This link is valid for 1 hour. If you did not request a password reset, please ignore this email.
`;

  const resend = getResendClient();

  if (resend) {
    try {
      const result = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject,
        html: htmlContent,
        text: textContent,
      });

      if (result.error) {
        console.error('Resend API error:', result.error);
        return { success: false, error: result.error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.error('Failed to send email via Resend:', err);
      return { success: false, error: err.message || 'Resend delivery failed' };
    }
  }

  // Fallback / Dev Mode output when RESEND_API_KEY is not configured
  console.log('\n================== [GGResume Password Reset Email (Resend API)] ==================');
  console.log(`To: ${email}`);
  console.log(`From: ${fromEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log('Note: To send real emails, set RESEND_API_KEY in your environment variables.');
  console.log('===================================================================================\n');

  return { success: true };
}
