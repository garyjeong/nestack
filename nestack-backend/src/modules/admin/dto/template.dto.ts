import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsEnum,
  MaxLength,
  Min,
} from 'class-validator';
import { GoalType, CategoryStatus } from '../../../common/enums';

export class CreateTemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Template description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Category ID' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ description: 'Goal type', enum: GoalType, required: false })
  @IsOptional()
  @IsEnum(GoalType)
  goalType?: GoalType;

  @ApiProperty({ description: 'Default goal amount', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultGoalAmount?: number;
}

export class UpdateTemplateDto {
  @ApiProperty({ description: 'Template name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ description: 'Template description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Category ID', required: false })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ description: 'Goal type', enum: GoalType, required: false })
  @IsOptional()
  @IsEnum(GoalType)
  goalType?: GoalType;

  @ApiProperty({ description: 'Default goal amount', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultGoalAmount?: number;

  @ApiProperty({ description: 'Status', enum: CategoryStatus, required: false })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;
}
