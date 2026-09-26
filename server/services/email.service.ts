import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
const FROM_EMAIL = 'CampusConnect <notifications@campusconnect.local>';

export class EmailService {
  static async sendPasswordResetEmail(toEmail: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;
    const subject = 'CampusConnect — Password Reset Request';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-radius: 12px;">
        <h2 style="color: #2563eb;">CampusConnect</h2>
        <h3>Password Reset Request</h3>
        <p>You requested a password reset for your CampusConnect account.</p>
        <p>Click the button below to set a new password. This token is valid for 30 minutes:</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
        </p>
        <p style="color: #64748b; font-size: 12px;">If you did not request this, please ignore this email.</p>
      </div>
    `;

    if (!resend) {
      console.warn(`[EmailService] RESEND_API_KEY not configured. Password reset link for ${toEmail}: ${resetUrl}`);
      return true;
    }

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: toEmail,
        subject,
        html,
      });
      return true;
    } catch (err) {
      console.error('[EmailService] Failed to send password reset email:', err);
      return false;
    }
  }

  static async sendLockoutNotificationEmail(toEmail: string): Promise<boolean> {
    const subject = 'CampusConnect — Account Security Alert: Account Locked';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-radius: 12px;">
        <h2 style="color: #dc2626;">CampusConnect Security Alert</h2>
        <h3>Account Temporarily Locked</h3>
        <p>Your account has been temporarily locked for 30 minutes due to 5 consecutive failed login attempts.</p>
        <p>If this was not you, we recommend resetting your password immediately after the lockout period expires.</p>
        <p style="margin: 24px 0;">
          <a href="${APP_URL}/forgot-password" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Initiate Password Reset</a>
        </p>
      </div>
    `;

    if (!resend) {
      console.warn(`[EmailService] RESEND_API_KEY not configured. Lockout alert sent to ${toEmail}`);
      return true;
    }

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: toEmail,
        subject,
        html,
      });
      return true;
    } catch (err) {
      console.error('[EmailService] Failed to send lockout email:', err);
      return false;
    }
  }
}
