import { Resolver, Query, Mutation, Args, ID, Int, Subscription } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationDto, UnreadCountDto } from './dto/notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();
export { pubSub };

@Resolver(() => NotificationDto)
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Query(() => [NotificationDto], { name: 'notifications' })
  @UseGuards(JwtAuthGuard)
  async getNotifications(
    @CurrentUser() user: any,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset: number,
  ) {
    return this.notificationsService.findByUser(user.id, limit, offset);
  }

  @Query(() => UnreadCountDto, { name: 'unreadNotificationCount' })
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@CurrentUser() user: any) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async markNotificationAsRead(
    @CurrentUser() user: any,
    @Args('id', { type: () => ID }) id: string,
  ) {
    await this.notificationsService.markAsRead(user.id, id);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async markAllNotificationsAsRead(@CurrentUser() user: any) {
    await this.notificationsService.markAllAsRead(user.id);
    return true;
  }

  @Subscription(() => NotificationDto, {
    filter: (payload: any, variables: any) => {
      return payload.notificationCreated.userId === variables.userId;
    },
  })
  notificationCreated(@Args('userId') userId: string) {
    return pubSub.asyncIterableIterator('notificationCreated');
  }
}
