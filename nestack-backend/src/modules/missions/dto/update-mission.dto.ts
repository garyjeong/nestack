import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  MaxLength,
  Min,
  IsBoolean,
} from 'class-validator';

export class UpdateMissionDto {
  @ApiProperty({ description: 'Mission name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ description: 'Mission description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Goal amount', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  goalAmount?: number;

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'Due date', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ description: 'Share with family', required: false })
  @IsOptional()
  @IsBoolean()
  shareWithFamily?: boolean;
}
