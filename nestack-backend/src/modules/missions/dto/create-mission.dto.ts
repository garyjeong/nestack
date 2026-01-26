import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  IsDateString,
  MaxLength,
  Min,
  IsBoolean,
} from 'class-validator';

export class CreateMissionDto {
  @ApiProperty({ description: 'Mission name', example: '결혼 자금 모으기' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Mission description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Category ID' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ description: 'Template ID', required: false })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiProperty({ description: 'Goal amount', example: 10000000 })
  @IsNumber()
  @Min(0)
  goalAmount: number;

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'Due date' })
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @ApiProperty({ description: 'Share with family', required: false })
  @IsOptional()
  @IsBoolean()
  shareWithFamily?: boolean;

  @ApiProperty({ description: 'Parent mission ID for sub-missions', required: false })
  @IsOptional()
  @IsUUID()
  parentMissionId?: string;
}
