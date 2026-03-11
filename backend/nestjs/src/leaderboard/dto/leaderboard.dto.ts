import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class LeaderboardEntryDto {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field(() => String, { nullable: true })
  fullName?: string | null;

  @Field(() => Int)
  reputationScore: number;

  @Field(() => Int)
  rank: number;
}
