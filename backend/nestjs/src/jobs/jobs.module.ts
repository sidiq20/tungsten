import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EmailService } from './email/email.service';
import { EmailProcessor } from './email/email.processor';
import { AnalyticsProcessor } from './analytics/analytics.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'analytics' },
    ),
  ],
  providers: [EmailService, EmailProcessor, AnalyticsProcessor],
  exports: [EmailService, BullModule],
})
export class JobsModule {}
