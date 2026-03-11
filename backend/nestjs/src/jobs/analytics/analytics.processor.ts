import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('analytics')
export class AnalyticsProcessor {
  private readonly logger = new Logger(AnalyticsProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process('update-leaderboard')
  async handleLeaderboardUpdate(job: Job) {
    this.logger.log('Updating leaderboard cache...');
    // Can update a cached leaderboard in Redis for faster reads
  }

  @Process('track-view')
  async handleViewTracking(job: Job<{ postId: string; userId?: string }>) {
    this.logger.log(`Tracking view for post ${job.data.postId}`);
    // Could aggregate view analytics
  }
}
