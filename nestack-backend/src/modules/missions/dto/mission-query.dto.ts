import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MissionStatus, MissionLevel } from '../../../common/enums';

export class MissionQueryDto {
  @ApiPropertyOptional({
    description: '미션 상태 필터',
    enum: MissionStatus,
  })
  @IsOptional()
  @IsEnum(MissionStatus)
  status?: MissionStatus;

  @ApiPropertyOptional({
    description: '미션 레벨 필터',
    enum: MissionLevel,
  })
  @IsOptional()
  @IsEnum(MissionLevel)
  level?: MissionLevel;

  @ApiPropertyOptional({
    description: '카테고리 ID 필터',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description: '상위 미션 ID 필터 (하위 미션만 조회)',
  })
  @IsOptional()
  @IsUUID()
  parentMissionId?: string;
}
