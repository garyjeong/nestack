import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsObject,
  MaxLength,
} from 'class-validator';
import {
  BadgeType,
  BadgeConditionType,
  CategoryStatus,
} from '../../../common/enums';

export class CreateBadgeDto {
  @ApiProperty({ description: 'Badge name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Badge description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Badge image URL', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiProperty({ description: 'Badge type', enum: BadgeType })
  @IsEnum(BadgeType)
  @IsNotEmpty()
  badgeType: BadgeType;

  @ApiProperty({ description: 'Condition type', enum: BadgeConditionType })
  @IsEnum(BadgeConditionType)
  @IsNotEmpty()
  conditionType: BadgeConditionType;

  @ApiProperty({ description: 'Condition value (JSON)' })
  @IsObject()
  @IsNotEmpty()
  conditionValue: Record<string, any>;
}

export class UpdateBadgeDto {
  @ApiProperty({ description: 'Badge name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ description: 'Badge description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Badge image URL', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiProperty({ description: 'Badge type', enum: BadgeType, required: false })
  @IsOptional()
  @IsEnum(BadgeType)
  badgeType?: BadgeType;

  @ApiProperty({
    description: 'Condition type',
    enum: BadgeConditionType,
    required: false,
  })
  @IsOptional()
  @IsEnum(BadgeConditionType)
  conditionType?: BadgeConditionType;

  @ApiProperty({ description: 'Condition value (JSON)', required: false })
  @IsOptional()
  @IsObject()
  conditionValue?: Record<string, any>;

  @ApiProperty({ description: 'Status', enum: CategoryStatus, required: false })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;
}

export class IssueBadgeDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Badge ID' })
  @IsUUID()
  @IsNotEmpty()
  badgeId: string;
}
