import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class NotificationDto {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  type: string;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field(() => String, { nullable: true })
  targetId?: string | null;

  @Field(() => String, { nullable: true })
  targetType?: string | null;

  @Field()
  isRead: boolean;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class UnreadCountDto {
  @Field(() => Int)
  count: number;
}
