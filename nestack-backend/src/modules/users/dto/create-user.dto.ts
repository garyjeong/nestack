import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthProvider } from '../../../common/enums';
import { PASSWORD_RULES } from '../../../common/constants';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @ApiPropertyOptional({ example: 'Password123!' })
  @IsOptional()
  @IsString()
  @MinLength(PASSWORD_RULES.MIN_LENGTH, { message: `비밀번호는 ${PASSWORD_RULES.MIN_LENGTH}자 이상이어야 합니다.` })
  @Matches(PASSWORD_RULES.PATTERN, { message: PASSWORD_RULES.MESSAGE })
  password?: string;

  @ApiProperty({ example: '홍길동' })
  @IsString()
  @MinLength(1, { message: '이름을 입력해주세요.' })
  @MaxLength(100, { message: '이름은 100자 이내로 입력해주세요.' })
  name: string;

  @ApiPropertyOptional({ enum: AuthProvider, default: AuthProvider.LOCAL })
  @IsOptional()
  @IsEnum(AuthProvider)
  provider?: AuthProvider;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  providerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profileImageUrl?: string;
}
