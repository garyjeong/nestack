import { ApiProperty } from '@nestjs/swagger';
import { Badge, UserBadge } from '../../../database/entities';
import { BadgeType, BadgeConditionType, BadgeIssueType } from '../../../common/enums';

export class BadgeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  imageUrl?: string;

  @ApiProperty({ enum: BadgeType })
  badgeType: BadgeType;

  @ApiProperty({ enum: BadgeConditionType })
  conditionType: BadgeConditionType;

  @ApiProperty()
  conditionValue: Record<string, any>;

  @ApiProperty({ description: 'Whether the user has earned this badge' })
  earned: boolean;

  @ApiProperty({ description: 'When the badge was earned', required: false })
  earnedAt?: Date;

  static fromEntity(badge: Badge, userBadge?: UserBadge): BadgeResponseDto {
    return {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      imageUrl: badge.imageUrl,
      badgeType: badge.badgeType,
      conditionType: badge.conditionType,
      conditionValue: badge.conditionValue,
      earned: !!userBadge,
      earnedAt: userBadge?.issuedAt,
    };
  }
}

export class UserBadgeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  badge: BadgeResponseDto;

  @ApiProperty({ enum: BadgeIssueType })
  issueType: BadgeIssueType;

  @ApiProperty()
  issuedAt: Date;

  static fromEntity(userBadge: UserBadge): UserBadgeResponseDto {
    return {
      id: userBadge.id,
      badge: BadgeResponseDto.fromEntity(userBadge.badge, userBadge),
      issueType: userBadge.issueType,
      issuedAt: userBadge.issuedAt,
    };
  }
}
