import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class JoinFamilyDto {
  @ApiProperty({ description: 'Invite code', example: 'ABCD-1234' })
  @IsString()
  @IsNotEmpty()
  code: string;
}
