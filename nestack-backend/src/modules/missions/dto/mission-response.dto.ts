import { ApiProperty } from '@nestjs/swagger';
import { Mission, LifeCycleCategory } from '../../../database/entities';
import { MissionStatus, MissionType, MissionLevel } from '../../../common/enums';

export class CategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  displayOrder: number;
}

export class MissionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  category: CategoryResponseDto | null;

  @ApiProperty()
  goalAmount: number;

  @ApiProperty()
  currentAmount: number;

  @ApiProperty()
  progress: number;

  @ApiProperty({ enum: MissionType })
  missionType: MissionType;

  @ApiProperty({ enum: MissionLevel })
  missionLevel: MissionLevel;

  @ApiProperty({ enum: MissionStatus })
  status: MissionStatus;

  @ApiProperty({ required: false })
  startDate?: Date;

  @ApiProperty()
  dueDate: Date;

  @ApiProperty()
  daysRemaining: number;

  @ApiProperty({ required: false })
  familyGroupId?: string;

  @ApiProperty({ required: false })
  parentMissionId?: string;

  @ApiProperty()
  createdAt: Date;

  static fromEntity(mission: Mission): MissionResponseDto {
    return {
      id: mission.id,
      name: mission.name,
      description: mission.description,
      category: mission.category
        ? {
            id: mission.category.id,
            name: mission.category.name,
            displayOrder: mission.category.displayOrder,
          }
        : null,
      goalAmount: Number(mission.goalAmount),
      currentAmount: Number(mission.currentAmount),
      progress: mission.progress,
      missionType: mission.missionType,
      missionLevel: mission.missionLevel,
      status: mission.status,
      startDate: mission.startDate,
      dueDate: mission.dueDate,
      daysRemaining: mission.daysRemaining,
      familyGroupId: mission.familyGroupId,
      parentMissionId: mission.parentMissionId,
      createdAt: mission.createdAt,
    };
  }
}

export class MissionSummaryDto {
  @ApiProperty()
  totalMissions: number;

  @ApiProperty()
  activeMissions: number;

  @ApiProperty()
  completedMissions: number;

  @ApiProperty()
  totalSavedAmount: number;

  @ApiProperty()
  totalGoalAmount: number;

  @ApiProperty()
  overallProgress: number;
}
