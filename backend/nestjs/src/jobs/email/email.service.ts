import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  /**
   * Send a verification email to the user.
   * In production, integrate with Nodemailer + SMTP or a transactional email provider.
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    this.logger.log(`[EMAIL] Sending verification email to ${email}`);
    // TODO: Integrate Nodemailer
    // const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;
    // await transporter.sendMail({ to: email, subject: 'Verify your account', html: ... });
  }

  /**
   * Send a notification email.
   */
  async sendNotificationEmail(
    email: string,
    subject: string,
    body: string,
  ): Promise<void> {
    this.logger.log(`[EMAIL] Sending notification to ${email}: ${subject}`);
    // TODO: Integrate Nodemailer
  }

  /**
   * Send a password reset email.
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    this.logger.log(`[EMAIL] Sending password reset to ${email}`);
    // TODO: Integrate Nodemailer
  }
}
