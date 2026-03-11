import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

/**
 * Subscribes to Redis Pub/Sub channels published by FastAPI.
 *
 * WHY PUB/SUB?
 * ─────────────────────────────────────────────────────────────────────────────
 * FastAPI and NestJS are two separate processes but share ONE Redis Cloud
 * instance. When FastAPI creates a note, updates a vote, etc., it PUBLISHes
 * a JSON message on a named channel. This service SUBSCRIBEs to those channels
 * so NestJS can push real-time WebSocket updates to connected clients — with
 * zero polling and zero HTTP calls between services.
 *
 * Subscriber clients need a DEDICATED connection because once you call
 * SUBSCRIBE the connection can only run SUBSCRIBE / UNSUBSCRIBE / PING.
 * That's why this is separate from the Bull queue connection.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Injectable()
export class RedisSubscriberService implements OnModuleInit, OnModuleDestroy {
  private subscriber: RedisClientType;
  private readonly logger = new Logger(RedisSubscriberService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
    @InjectQueue('analytics') private readonly analyticsQueue: Queue,
  ) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      this.logger.warn('REDIS_URL not set — skipping Redis Pub/Sub subscriber');
      return;
    }

    // Dedicated subscriber connection — separate from the Bull queue connection
    this.subscriber = createClient({ url: redisUrl }) as RedisClientType;

    this.subscriber.on('error', (err) => {
      this.logger.error(`Redis subscriber error: ${err.message}`);
    });

    await this.subscriber.connect();
    this.logger.log('Redis Pub/Sub subscriber connected');

    // ── Channels published by FastAPI ────────────────────────────────────────

    await this.subscriber.subscribe('note_created', async (message) => {
      try {
        await this.handleNoteCreated(JSON.parse(message));
      } catch (err) {
        this.logger.error(`Error handling note_created: ${err.message}`);
      }
    });

    await this.subscriber.subscribe('vote_updated', async (message) => {
      try {
        await this.handleVoteUpdated(JSON.parse(message));
      } catch (err) {
        this.logger.error(`Error handling vote_updated: ${err.message}`);
      }
    });

    this.logger.log('Subscribed to channels: note_created, vote_updated');
  }

  async onModuleDestroy() {
    if (this.subscriber?.isOpen) {
      await this.subscriber.unsubscribe();
      await this.subscriber.quit();
      this.logger.log('Redis Pub/Sub subscriber disconnected');
    }
  }

  // ── Event Handlers ────────────────────────────────────────────────────────

  async handleNoteCreated(data: {
    note_id: string;
    uploader_id: string;
    status: string;
  }) {
    this.logger.log(`[note_created] noteId=${data.note_id} by userId=${data.uploader_id}`);

    // 1. Create a notification for the uploader
    await this.notificationsService.create({
      userId: data.uploader_id,
      type: 'note_created',
      title: 'Note Uploaded',
      content: 'Your study material has been uploaded successfully.',
      targetId: data.note_id,
      targetType: 'note',
    });

    // 2. Trigger analytics update via Bull queue
    await this.analyticsQueue.add('update-leaderboard', {
      uploaderId: data.uploader_id,
      action: 'upload',
    });
  }

  async handleVoteUpdated(data: {
    target_id: string;
    target_type: string;
    new_count: number;
  }) {
    this.logger.log(
      `[vote_updated] ${data.target_type} ${data.target_id} → ${data.new_count} votes`,
    );

    // Broadcast the new count to all clients via WebSocket
    this.notificationsGateway.broadcast('vote_count', {
      id: data.target_id,
      type: data.target_type,
      count: data.new_count,
    });
  }
}
