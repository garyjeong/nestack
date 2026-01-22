import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMissionDto {
  @ApiPropertyOptional({
    description: '미션 이름',
    example: '결혼 자금 모으기',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: '미션 설명',
    example: '결혼식 비용 5천만원 목표',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: '목표 금액',
    example: 50000000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  goalAmount?: number;

  @ApiPropertyOptional({
    description: '시작일',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: '목표일',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
