import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';

// 비밀번호 정규식: 영문, 숫자, 특수문자(@$!%*?&) 각 1자 이상 포함
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
const PASSWORD_MESSAGE = '비밀번호는 영문, 숫자, 특수문자(@$!%*?&)를 각각 1자 이상 포함해야 합니다';

export class ChangePasswordDto {
  @ApiProperty({ description: '현재 비밀번호' })
  @IsString()
  @IsNotEmpty({ message: '현재 비밀번호를 입력해주세요' })
  currentPassword: string;

  @ApiProperty({
    example: 'NewPassword1!',
    description: '새 비밀번호 (8자 이상, 영문/숫자/특수문자 포함)'
  })
  @IsString()
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다' })
  @MaxLength(30, { message: '비밀번호는 30자 이하여야 합니다' })
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  newPassword: string;
}
