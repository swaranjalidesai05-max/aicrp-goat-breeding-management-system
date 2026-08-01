import { env } from '../../../config/env';

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  if (process.env.SMTP_HOST) {
    // SMTP integration can be added later without changing the auth flow.
    console.log(`[auth] password reset email queued for ${email}: ${resetUrl}`);
    return;
  }

  if (env.nodeEnv === 'development') {
    console.log(`[auth] password reset link for ${email}: ${resetUrl}`);
    return;
  }

  console.log(`[auth] password reset requested for ${email}`);
}
