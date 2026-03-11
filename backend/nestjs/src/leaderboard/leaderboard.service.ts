import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getTopUsers(limit = 10) {
    const users = await this.prisma.user.findMany({
      where: { isBanned: false },
      orderBy: { reputationScore: 'desc' },
      take: limit,
      select: {
        id: true,
        username: true,
        fullName: true,
        reputationScore: true,
      },
    });

    return users.map((user: { id: string; username: string; fullName: string | null; reputationScore: number }, index: number) => ({
      ...user,
      rank: index + 1,
    }));
  }

  async getUserRank(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { reputationScore: true },
    });

    if (!user) return null;

    const rank = await this.prisma.user.count({
      where: {
        reputationScore: { gt: user.reputationScore },
        isBanned: false,
      },
    });

    return rank + 1;
  }
}
