import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

// Core modules
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

// Feature modules
import { CommentsModule } from './comments/comments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { JobsModule } from './jobs/jobs.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    // Load .env from backend/nestjs/.env
    ConfigModule.forRoot({ isGlobal: true }),

    // GraphQL with Apollo
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },
    }),

    // Bull Queue (Redis-backed)
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        if (redisUrl) {
          const url = new URL(redisUrl);
          return {
            redis: {
              host: url.hostname,
              port: Number(url.port) || 6379,
              username: url.username || 'default',
              password: decodeURIComponent(url.password),
              tls: url.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined,
            },
          };
        }
        return { redis: { host: 'localhost', port: 6379 } };
      },
      inject: [ConfigService],
    }),

    // Core
    PrismaModule,
    AuthModule,

    // Features
    CommentsModule,
    NotificationsModule,
    LeaderboardModule,
    JobsModule,
    RedisModule,
  ],
})
export class AppModule {}
