import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PASSWORD_RULES } from '../../../common/constants';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token from email' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @MinLength(PASSWORD_RULES.MIN_LENGTH, { message: `비밀번호는 ${PASSWORD_RULES.MIN_LENGTH}자 이상이어야 합니다.` })
  @Matches(PASSWORD_RULES.PATTERN, { message: PASSWORD_RULES.MESSAGE })
  newPassword: string;
}
