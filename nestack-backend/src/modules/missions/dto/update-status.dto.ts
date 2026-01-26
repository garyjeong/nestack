import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { MissionStatus } from '../../../common/enums';

export class UpdateMissionStatusDto {
  @ApiProperty({ description: 'New mission status', enum: MissionStatus })
  @IsEnum(MissionStatus)
  @IsNotEmpty()
  status: MissionStatus;
}
