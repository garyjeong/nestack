import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { BadgesService } from './badges.service';
import { CurrentUser } from '../../common/decorators';
import { User } from '../users/entities/user.entity';

@ApiTags('badges')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'badges', version: '1' })
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get()
  @ApiOperation({ summary: '전체 뱃지 목록 조회' })
  @ApiResponse({ status: 200, description: '뱃지 목록 반환' })
  async getAllBadges() {
    const badges = await this.badgesService.getAllBadges();
    return { badges };
  }

  @Get('me')
  @ApiOperation({ summary: '내 뱃지 목록 조회 (획득/미획득 포함)' })
  @ApiResponse({ status: 200, description: '내 뱃지 목록 반환' })
  async getMyBadges(@CurrentUser() user: User) {
    const badges = await this.badgesService.getUserBadgesWithStatus(user.id);
    return {
      badges,
      earnedCount: badges.filter((b) => b.earned).length,
      totalCount: badges.length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '뱃지 상세 조회' })
  @ApiParam({ name: 'id', description: '뱃지 ID' })
  @ApiResponse({ status: 200, description: '뱃지 상세 정보 반환' })
  @ApiResponse({ status: 404, description: '뱃지를 찾을 수 없음' })
  async getBadgeById(@Param('id', ParseUUIDPipe) id: string) {
    const badge = await this.badgesService.getBadgeById(id);
    return { badge };
  }
}
