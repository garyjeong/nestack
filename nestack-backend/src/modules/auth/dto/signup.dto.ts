import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

// 비밀번호 정규식: 영문, 숫자, 특수문자(@$!%*?&) 각 1자 이상 포함
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
const PASSWORD_MESSAGE = '비밀번호는 영문, 숫자, 특수문자(@$!%*?&)를 각각 1자 이상 포함해야 합니다';

export class SignupDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다' })
  @IsNotEmpty({ message: '이메일을 입력해주세요' })
  email: string;

  @ApiProperty({
    example: 'Password1!',
    description: '비밀번호 (8자 이상, 영문/숫자/특수문자 포함)'
  })
  @IsString()
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다' })
  @MaxLength(30, { message: '비밀번호는 30자 이하여야 합니다' })
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password: string;

  @ApiProperty({ example: '홍길동', description: '사용자 이름 (2-50자)' })
  @IsString()
  @IsNotEmpty({ message: '이름을 입력해주세요' })
  @MinLength(2, { message: '이름은 2자 이상이어야 합니다' })
  @MaxLength(50, { message: '이름은 50자 이하여야 합니다' })
  name: string;
}
