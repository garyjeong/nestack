import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  activeUsers: number;

  @ApiProperty()
  newUsersToday: number;

  @ApiProperty()
  totalFamilyGroups: number;

  @ApiProperty()
  totalMissions: number;

  @ApiProperty()
  completedMissions: number;

  @ApiProperty()
  totalSavingsAmount: number;

  @ApiProperty()
  activeBadges: number;
}
