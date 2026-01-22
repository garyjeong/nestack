import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  Patch,
  ApiBody,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FamilyService } from './family.service';
import { JoinFamilyDto, UpdateShareSettingsDto } from './dto';
import { CurrentUser } from '../../common/decorators';
import { User } from '../users/entities/user.entity';

@ApiTags('family')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'family', version: '1' })
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post('create')
  @ApiOperation({ summary: '가족 그룹 생성' })
  @ApiResponse({ status: 201, description: '가족 그룹 생성 및 초대 코드 발급' })
  @ApiResponse({ status: 400, description: '이미 가족 그룹에 속해 있음' })
  async createFamilyGroup(@CurrentUser() user: User) {
    const result = await this.familyService.createFamilyGroup(user.id);
    return {
      familyGroup: {
        id: result.familyGroup.id,
        status: result.familyGroup.status,
        createdAt: result.familyGroup.createdAt,
      },
      inviteCode: result.inviteCode,
      message: '가족 그룹이 생성되었습니다.',
    };
  }

  @Get('invite-code')
  @ApiOperation({ summary: '현재 초대 코드 조회' })
  @ApiResponse({ status: 200, description: '초대 코드 반환' })
  async getInviteCode(@CurrentUser() user: User) {
    const inviteCode = await this.familyService.getActiveInviteCode(user.id);
    return {
      inviteCode: inviteCode?.code || null,
      expiresAt: inviteCode?.expiresAt || null,
    };
  }

  @Post('invite-code/regenerate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '초대 코드 재발급' })
  @ApiResponse({ status: 200, description: '새 초대 코드 발급' })
  @ApiResponse({ status: 400, description: '가족 그룹에 속해 있지 않음' })
  async regenerateInviteCode(@CurrentUser() user: User) {
    const inviteCode = await this.familyService.regenerateInviteCode(user.id);
    return {
      inviteCode: inviteCode.code,
      expiresAt: inviteCode.expiresAt,
      message: '새 초대 코드가 발급되었습니다.',
    };
  }

  @Post('join')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '가족 그룹 가입 (초대 코드 사용)' })
  @ApiResponse({ status: 200, description: '가족 그룹 가입 성공' })
  @ApiResponse({ status: 400, description: '유효하지 않은 초대 코드' })
  async joinFamily(
    @CurrentUser() user: User,
    @Body() joinFamilyDto: JoinFamilyDto,
  ) {
    const familyGroup = await this.familyService.joinFamily(user.id, joinFamilyDto);
    return {
      familyGroup: {
        id: familyGroup.id,
        status: familyGroup.status,
        createdAt: familyGroup.createdAt,
        memberCount: familyGroup.members.length,
      },
      message: '가족 그룹에 가입되었습니다.',
    };
  }

  @Get()
  @ApiOperation({ summary: '가족 정보 조회' })
  @ApiResponse({ status: 200, description: '가족 정보 반환' })
  async getFamilyInfo(@CurrentUser() user: User) {
    const info = await this.familyService.getFamilyInfo(user.id);

    if (!info.familyGroup) {
      return {
        hasFamily: false,
        familyGroup: null,
        partner: null,
        inviteCode: null,
      };
    }

    return {
      hasFamily: true,
      familyGroup: {
        id: info.familyGroup.id,
        status: info.familyGroup.status,
        createdAt: info.familyGroup.createdAt,
        memberCount: info.familyGroup.members.length,
      },
      partner: info.partner,
      inviteCode: info.inviteCode,
    };
  }

  @Delete('leave')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '가족 그룹 탈퇴' })
  @ApiResponse({ status: 200, description: '가족 그룹 탈퇴 완료' })
  @ApiResponse({ status: 400, description: '가족 그룹에 속해 있지 않음' })
  async leaveFamily(@CurrentUser() user: User) {
    await this.familyService.leaveFamily(user.id);
    return { message: '가족 그룹에서 탈퇴하였습니다.' };
  }

  @Get('share-settings')
  @ApiOperation({ summary: '데이터 공유 설정 조회' })
  @ApiResponse({ status: 200, description: '공유 설정 조회 성공' })
  async getShareSettings(@CurrentUser() user: User) {
    const accounts = await this.familyService.getShareSettings(user.id);
    return { accounts };
  }

  @Patch('share-settings')
  @ApiOperation({ summary: '데이터 공유 설정 변경' })
  @ApiBody({ type: UpdateShareSettingsDto })
  @ApiResponse({ status: 200, description: '공유 설정 변경 성공' })
  @ApiResponse({ status: 400, description: '요청 형식이 올바르지 않습니다.' })
  async updateShareSettings(
    @CurrentUser() user: User,
    @Body() updateShareSettingsDto: UpdateShareSettingsDto,
  ) {
    const updatedAccounts = await this.familyService.updateShareSettings(user.id, updateShareSettingsDto);
    return {
      message: '공유 설정이 변경되었습니다.',
      updatedAccounts,
    };
  }
}
