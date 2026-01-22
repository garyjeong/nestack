import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinFamilyDto {
  @ApiProperty({
    description: '초대 코드',
    example: 'ABC123XYZ789',
  })
  @IsNotEmpty()
  @IsString()
  @Length(12, 12, { message: '초대 코드는 12자리입니다.' })
  inviteCode: string;
}
