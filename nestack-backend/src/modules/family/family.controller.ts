import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FamilyService } from './family.service';
import {
  JoinFamilyDto,
  UpdateShareSettingsDto,
  FamilyResponseDto,
  InviteCodeResponseDto,
  ShareSettingsResponseDto,
} from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities';

@ApiTags('Family')
@ApiBearerAuth()
@Controller('family')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a family group' })
  @ApiResponse({ status: 201, description: 'Family group created' })
  @ApiResponse({ status: 409, description: 'Already in a family group' })
  async createFamily(@CurrentUser() user: User): Promise<FamilyResponseDto> {
    return this.familyService.createFamily(user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get family group info' })
  @ApiResponse({ status: 200, description: 'Family group info retrieved' })
  @ApiResponse({ status: 404, description: 'Not in a family group' })
  async getFamily(@CurrentUser() user: User): Promise<FamilyResponseDto> {
    return this.familyService.getFamily(user.id);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Leave family group' })
  @ApiResponse({ status: 200, description: 'Left family group' })
  @ApiResponse({ status: 404, description: 'Not in a family group' })
  async leaveFamily(@CurrentUser() user: User): Promise<{ message: string }> {
    await this.familyService.leaveFamily(user.id);
    return { message: 'Left family group successfully' };
  }

  @Post('join')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Join a family group with invite code' })
  @ApiResponse({ status: 200, description: 'Joined family group' })
  @ApiResponse({ status: 400, description: 'Invalid invite code' })
  @ApiResponse({ status: 409, description: 'Already in a family group' })
  async joinFamily(
    @CurrentUser() user: User,
    @Body() dto: JoinFamilyDto,
  ): Promise<FamilyResponseDto> {
    return this.familyService.joinFamily(user.id, dto);
  }

  @Get('invite-code')
  @ApiOperation({ summary: 'Get current invite code' })
  @ApiResponse({ status: 200, description: 'Invite code retrieved' })
  @ApiResponse({ status: 404, description: 'Not in a family group' })
  async getInviteCode(@CurrentUser() user: User): Promise<InviteCodeResponseDto> {
    return this.familyService.getInviteCode(user.id);
  }

  @Post('invite-code')
  @ApiOperation({ summary: 'Regenerate invite code' })
  @ApiResponse({ status: 201, description: 'New invite code created' })
  @ApiResponse({ status: 404, description: 'Not in a family group' })
  async regenerateInviteCode(
    @CurrentUser() user: User,
  ): Promise<InviteCodeResponseDto> {
    return this.familyService.regenerateInviteCode(user.id);
  }

  @Get('share-settings')
  @ApiOperation({ summary: 'Get share settings' })
  @ApiResponse({ status: 200, description: 'Share settings retrieved' })
  @ApiResponse({ status: 404, description: 'Not in a family group' })
  async getShareSettings(
    @CurrentUser() user: User,
  ): Promise<ShareSettingsResponseDto> {
    return this.familyService.getShareSettings(user.id);
  }

  @Patch('share-settings')
  @ApiOperation({ summary: 'Update share settings' })
  @ApiResponse({ status: 200, description: 'Share settings updated' })
  @ApiResponse({ status: 404, description: 'Not in a family group' })
  async updateShareSettings(
    @CurrentUser() user: User,
    @Body() dto: UpdateShareSettingsDto,
  ): Promise<ShareSettingsResponseDto> {
    return this.familyService.updateShareSettings(user.id, dto);
  }
}
