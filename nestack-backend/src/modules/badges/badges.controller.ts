import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BadgesService } from './badges.service';
import { BadgeResponseDto, UserBadgeResponseDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities';

@ApiTags('Badges')
@ApiBearerAuth()
@Controller('badges')
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all badges with user progress' })
  @ApiResponse({ status: 200, description: 'Badges retrieved' })
  async getAllBadges(@CurrentUser() user: User): Promise<BadgeResponseDto[]> {
    return this.badgesService.getAllBadges(user.id);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get badges earned by current user' })
  @ApiResponse({ status: 200, description: 'User badges retrieved' })
  async getMyBadges(@CurrentUser() user: User): Promise<UserBadgeResponseDto[]> {
    return this.badgesService.getMyBadges(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get badge details' })
  @ApiResponse({ status: 200, description: 'Badge retrieved' })
  @ApiResponse({ status: 404, description: 'Badge not found' })
  async getBadge(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<BadgeResponseDto> {
    return this.badgesService.getBadge(user.id, id);
  }
}
