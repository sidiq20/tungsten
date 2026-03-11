import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { EmailService } from './email.service';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {}

  @Process('verification')
  async handleVerification(job: Job<{ email: string; token: string }>) {
    this.logger.log(`Processing verification email for ${job.data.email}`);
    await this.emailService.sendVerificationEmail(job.data.email, job.data.token);
  }

  @Process('notification')
  async handleNotification(
    job: Job<{ email: string; subject: string; body: string }>,
  ) {
    this.logger.log(`Processing notification email for ${job.data.email}`);
    await this.emailService.sendNotificationEmail(
      job.data.email,
      job.data.subject,
      job.data.body,
    );
  }

  @Process('password-reset')
  async handlePasswordReset(job: Job<{ email: string; token: string }>) {
    this.logger.log(`Processing password reset email for ${job.data.email}`);
    await this.emailService.sendPasswordResetEmail(job.data.email, job.data.token);
  }
}
