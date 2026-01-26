import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MissionsService } from './missions.service';
import {
  CreateMissionDto,
  UpdateMissionDto,
  MissionFilterDto,
  MissionResponseDto,
  MissionSummaryDto,
  CategoryResponseDto,
  UpdateMissionStatusDto,
  LinkTransactionsDto,
} from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, MissionTemplate } from '../../database/entities';
import { PaginatedResponse } from '../../common/dto/api-response.dto';

@ApiTags('Missions')
@ApiBearerAuth()
@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get all lifecycle categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved' })
  async getCategories(): Promise<CategoryResponseDto[]> {
    return this.missionsService.getCategories();
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get mission templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved' })
  async getTemplates(
    @Query('categoryId') categoryId?: string,
  ): Promise<MissionTemplate[]> {
    return this.missionsService.getTemplates(categoryId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new mission' })
  @ApiResponse({ status: 201, description: 'Mission created' })
  async createMission(
    @CurrentUser() user: User,
    @Body() dto: CreateMissionDto,
  ): Promise<MissionResponseDto> {
    return this.missionsService.createMission(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all missions with filters' })
  @ApiResponse({ status: 200, description: 'Missions retrieved' })
  async getMissions(
    @CurrentUser() user: User,
    @Query() filters: MissionFilterDto,
  ): Promise<PaginatedResponse<MissionResponseDto>> {
    return this.missionsService.getMissions(user.id, filters);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get mission summary statistics' })
  @ApiResponse({ status: 200, description: 'Summary retrieved' })
  async getMissionSummary(@CurrentUser() user: User): Promise<MissionSummaryDto> {
    return this.missionsService.getMissionSummary(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get mission by ID' })
  @ApiResponse({ status: 200, description: 'Mission retrieved' })
  @ApiResponse({ status: 404, description: 'Mission not found' })
  async getMission(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<MissionResponseDto> {
    return this.missionsService.getMission(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update mission' })
  @ApiResponse({ status: 200, description: 'Mission updated' })
  @ApiResponse({ status: 404, description: 'Mission not found' })
  async updateMission(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateMissionDto,
  ): Promise<MissionResponseDto> {
    return this.missionsService.updateMission(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete mission' })
  @ApiResponse({ status: 200, description: 'Mission deleted' })
  @ApiResponse({ status: 404, description: 'Mission not found' })
  async deleteMission(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.missionsService.deleteMission(user.id, id);
    return { message: 'Mission deleted successfully' };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update mission status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 404, description: 'Mission not found' })
  async updateMissionStatus(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateMissionStatusDto,
  ): Promise<MissionResponseDto> {
    return this.missionsService.updateMissionStatus(user.id, id, dto);
  }

  @Post(':id/transactions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Link transactions to mission' })
  @ApiResponse({ status: 200, description: 'Transactions linked' })
  @ApiResponse({ status: 404, description: 'Mission not found' })
  async linkTransactions(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: LinkTransactionsDto,
  ): Promise<MissionResponseDto> {
    return this.missionsService.linkTransactions(user.id, id, dto);
  }
}
