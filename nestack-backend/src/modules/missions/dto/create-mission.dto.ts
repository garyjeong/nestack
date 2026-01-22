import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsEnum,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MissionType, MissionLevel } from '../../../common/enums';

export class CreateMissionDto {
  @ApiPropertyOptional({
    description: '템플릿 ID (템플릿 기반 미션 생성 시)',
    example: 'uuid-template-id',
  })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiProperty({
    description: '카테고리 ID',
    example: 'uuid-category-id',
  })
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({
    description: '상위 미션 ID (하위 미션 생성 시)',
    example: 'uuid-parent-mission-id',
  })
  @IsOptional()
  @IsUUID()
  parentMissionId?: string;

  @ApiProperty({
    description: '미션 이름',
    example: '결혼 자금 모으기',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: '미션 설명',
    example: '결혼식 비용 5천만원 목표',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '목표 금액',
    example: 50000000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  goalAmount: number;

  @ApiPropertyOptional({
    description: '미션 유형',
    enum: MissionType,
    default: MissionType.CUSTOM,
  })
  @IsOptional()
  @IsEnum(MissionType)
  missionType?: MissionType;

  @ApiPropertyOptional({
    description: '미션 레벨',
    enum: MissionLevel,
    default: MissionLevel.MAIN,
  })
  @IsOptional()
  @IsEnum(MissionLevel)
  missionLevel?: MissionLevel;

  @ApiPropertyOptional({
    description: '시작일',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: '목표일',
    example: '2025-12-31',
  })
  @IsNotEmpty()
  @IsDateString()
  dueDate: string;
}
