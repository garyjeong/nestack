import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { MissionStatus, MissionLevel } from '../../../common/enums';
import { PaginationQueryDto } from '../../../common/dto/api-response.dto';

export class MissionFilterDto extends PaginationQueryDto {
  @ApiProperty({ description: 'Category ID', required: false })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ description: 'Mission status', required: false, enum: MissionStatus })
  @IsOptional()
  @IsEnum(MissionStatus)
  status?: MissionStatus;

  @ApiProperty({ description: 'Mission level', required: false, enum: MissionLevel })
  @IsOptional()
  @IsEnum(MissionLevel)
  level?: MissionLevel;

  @ApiProperty({ description: 'Include family missions', required: false })
  @IsOptional()
  includeFamily?: boolean;
}
