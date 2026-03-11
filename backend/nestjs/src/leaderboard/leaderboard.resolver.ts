import { Resolver, Query, Args, Int, ID } from '@nestjs/graphql';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardEntryDto } from './dto/leaderboard.dto';

@Resolver(() => LeaderboardEntryDto)
export class LeaderboardResolver {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Query(() => [LeaderboardEntryDto], { name: 'leaderboard' })
  async getLeaderboard(
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ) {
    return this.leaderboardService.getTopUsers(limit);
  }

  @Query(() => Int, { name: 'userRank', nullable: true })
  async getUserRank(@Args('userId', { type: () => ID }) userId: string) {
    return this.leaderboardService.getUserRank(userId);
  }
}
