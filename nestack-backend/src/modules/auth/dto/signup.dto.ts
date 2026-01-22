import { IsEmail, IsString, MinLength, MaxLength, Matches, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PASSWORD_RULES } from '../../../common/constants';

export class SignupDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(PASSWORD_RULES.MIN_LENGTH, { message: `비밀번호는 ${PASSWORD_RULES.MIN_LENGTH}자 이상이어야 합니다.` })
  @Matches(PASSWORD_RULES.PATTERN, { message: PASSWORD_RULES.MESSAGE })
  password: string;

  @ApiProperty({ example: '홍길동' })
  @IsString()
  @MinLength(1, { message: '이름을 입력해주세요.' })
  @MaxLength(100, { message: '이름은 100자 이내로 입력해주세요.' })
  name: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  termsAgreed: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  privacyAgreed: boolean;
}
