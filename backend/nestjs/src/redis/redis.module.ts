import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisSubscriberService } from './redis-subscriber.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [ConfigModule, NotificationsModule, JobsModule],
  providers: [RedisSubscriberService],
  exports: [RedisSubscriberService],
})
export class RedisModule {}
