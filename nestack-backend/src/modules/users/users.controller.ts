import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto';
import { CurrentUser } from '../../common/decorators';
import { User } from './entities/user.entity';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: '내 정보 조회' })
  @ApiResponse({ status: 200, description: '프로필 정보 반환' })
  async getMe(@CurrentUser() user: User) {
    const profile = await this.usersService.getProfile(user.id);
    return this.formatUserResponse(profile);
  }

  @Patch('me')
  @ApiOperation({ summary: '내 정보 수정' })
  @ApiResponse({ status: 200, description: '수정된 프로필 정보 반환' })
  async updateMe(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const updatedUser = await this.usersService.updateProfile(user.id, updateProfileDto);
    return this.formatUserResponse(updatedUser);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '비밀번호 변경' })
  @ApiResponse({ status: 200, description: '비밀번호 변경 완료' })
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(user.id, changePasswordDto);
    return { message: '비밀번호가 변경되었습니다.' };
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiResponse({ status: 200, description: '회원 탈퇴 완료' })
  async withdraw(
    @CurrentUser() user: User,
    @Body('password') password: string,
  ) {
    await this.usersService.withdraw(user.id, password);
    return { message: '회원 탈퇴가 완료되었습니다.' };
  }

  /**
   * Format user response (remove sensitive data)
   */
  private formatUserResponse(user: User) {
    const { passwordHash, deletedAt, ...userData } = user;

    // Format family group info
    let familyGroupInfo = null;
    if (user.familyGroup) {
      const partner = user.familyGroup.members?.find((m) => m.id !== user.id);
      familyGroupInfo = {
        id: user.familyGroup.id,
        createdAt: user.familyGroup.createdAt,
        partner: partner
          ? {
              id: partner.id,
              name: partner.name,
              profileImageUrl: partner.profileImageUrl,
            }
          : null,
      };
    }

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      profileImageUrl: userData.profileImageUrl,
      provider: userData.provider,
      emailVerified: userData.emailVerified,
      status: userData.status,
      familyGroup: familyGroupInfo,
      createdAt: userData.createdAt,
    };
  }
}
