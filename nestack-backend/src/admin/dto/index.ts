import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
  MinLength,
  IsNotEmpty,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  AdminRole,
  AdminStatus,
  UserStatus,
  CategoryStatus,
  BadgeType,
  DisplayType,
  AnnouncementStatus,
  GoalType,
} from '../../common/enums';

// ==================== Admin Auth DTOs ====================

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@nestack.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin1234!@' })
  @IsString()
  @MinLength(8)
  password: string;
}

export class AdminLoginResponseDto {
  accessToken: string;
  admin: {
    id: string;
    email: string;
    name: string;
    role: AdminRole;
  };
}

// ==================== User Management DTOs ====================

export class UserQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class UpdateUserStatusDto {
  @ApiProperty({ enum: UserStatus })
  @IsEnum(UserStatus)
  status: UserStatus;
}

// ==================== Category DTOs ====================

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  displayOrder?: number;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiPropertyOptional({ enum: CategoryStatus })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;
}

// ==================== Mission Template DTOs ====================

export class CreateTemplateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({ enum: GoalType })
  @IsOptional()
  @IsEnum(GoalType)
  goalType?: GoalType;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  defaultGoalAmount?: number;
}

export class UpdateTemplateDto extends PartialType(CreateTemplateDto) {
  @ApiPropertyOptional({ enum: CategoryStatus })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;
}

// ==================== Badge DTOs ====================

export class CreateBadgeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ enum: BadgeType })
  @IsEnum(BadgeType)
  badgeType: BadgeType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  conditionType: string;

  @ApiProperty()
  @IsNotEmpty()
  conditionValue: Record<string, any>;
}

export class UpdateBadgeDto extends PartialType(CreateBadgeDto) {
  @ApiPropertyOptional({ enum: CategoryStatus })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;
}

export class IssueBadgeDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsUUID()
  badgeId: string;
}

// ==================== Announcement DTOs ====================

export class CreateAnnouncementDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ enum: DisplayType })
  @IsEnum(DisplayType)
  displayType: DisplayType;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;
}

export class UpdateAnnouncementDto extends PartialType(CreateAnnouncementDto) {
  @ApiPropertyOptional({ enum: AnnouncementStatus })
  @IsOptional()
  @IsEnum(AnnouncementStatus)
  status?: AnnouncementStatus;
}

// ==================== Statistics DTOs ====================

export class DateRangeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class DashboardStatsDto {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisMonth: number;
  totalFamilyGroups: number;
  totalMissions: number;
  completedMissions: number;
  missionCompletionRate: number;
  totalBadgesIssued: number;
}
