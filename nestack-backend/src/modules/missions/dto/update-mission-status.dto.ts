import { IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MissionStatus } from '../../../common/enums';

export class UpdateMissionStatusDto {
  @ApiProperty({
    description: '미션 상태',
    enum: MissionStatus,
    example: MissionStatus.IN_PROGRESS,
  })
  @IsNotEmpty()
  @IsEnum(MissionStatus)
  status: MissionStatus;
}
