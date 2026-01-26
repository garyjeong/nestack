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
import { AdminService } from './admin.service';
import {
  AdminLoginDto,
  AdminTokenResponseDto,
  DashboardStatsDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateTemplateDto,
  UpdateTemplateDto,
  CreateBadgeDto,
  UpdateBadgeDto,
  IssueBadgeDto,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from './dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  User,
  LifeCycleCategory,
  MissionTemplate,
  Badge,
  UserBadge,
  Announcement,
} from '../../database/entities';
import { UserStatus } from '../../common/enums';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Auth
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: AdminLoginDto): Promise<AdminTokenResponseDto> {
    return this.adminService.login(dto);
  }

  // Dashboard
  @Get('dashboard')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved' })
  async getDashboardStats(): Promise<DashboardStatsDto> {
    return this.adminService.getDashboardStats();
  }

  // Users
  @Get('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved' })
  async getUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ users: User[]; total: number }> {
    return this.adminService.getUsers(page, limit);
  }

  @Patch('users/:id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user status' })
  @ApiResponse({ status: 200, description: 'User status updated' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body('status') status: UserStatus,
  ): Promise<User> {
    return this.adminService.updateUserStatus(id, status);
  }

  // Categories
  @Get('categories')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved' })
  async getCategories(): Promise<LifeCycleCategory[]> {
    return this.adminService.getCategories();
  }

  @Post('categories')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category' })
  @ApiResponse({ status: 201, description: 'Category created' })
  async createCategory(@Body() dto: CreateCategoryDto): Promise<LifeCycleCategory> {
    return this.adminService.createCategory(dto);
  }

  @Patch('categories/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200, description: 'Category updated' })
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<LifeCycleCategory> {
    return this.adminService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200, description: 'Category deleted' })
  async deleteCategory(@Param('id') id: string): Promise<{ message: string }> {
    await this.adminService.deleteCategory(id);
    return { message: 'Category deleted successfully' };
  }

  // Templates
  @Get('templates')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved' })
  async getTemplates(): Promise<MissionTemplate[]> {
    return this.adminService.getTemplates();
  }

  @Post('templates')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create template' })
  @ApiResponse({ status: 201, description: 'Template created' })
  async createTemplate(@Body() dto: CreateTemplateDto): Promise<MissionTemplate> {
    return this.adminService.createTemplate(dto);
  }

  @Patch('templates/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update template' })
  @ApiResponse({ status: 200, description: 'Template updated' })
  async updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
  ): Promise<MissionTemplate> {
    return this.adminService.updateTemplate(id, dto);
  }

  @Delete('templates/:id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete template' })
  @ApiResponse({ status: 200, description: 'Template deleted' })
  async deleteTemplate(@Param('id') id: string): Promise<{ message: string }> {
    await this.adminService.deleteTemplate(id);
    return { message: 'Template deleted successfully' };
  }

  // Badges
  @Get('badges')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all badges' })
  @ApiResponse({ status: 200, description: 'Badges retrieved' })
  async getBadges(): Promise<Badge[]> {
    return this.adminService.getBadges();
  }

  @Post('badges')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create badge' })
  @ApiResponse({ status: 201, description: 'Badge created' })
  async createBadge(@Body() dto: CreateBadgeDto): Promise<Badge> {
    return this.adminService.createBadge(dto);
  }

  @Patch('badges/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update badge' })
  @ApiResponse({ status: 200, description: 'Badge updated' })
  async updateBadge(
    @Param('id') id: string,
    @Body() dto: UpdateBadgeDto,
  ): Promise<Badge> {
    return this.adminService.updateBadge(id, dto);
  }

  @Delete('badges/:id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete badge' })
  @ApiResponse({ status: 200, description: 'Badge deleted' })
  async deleteBadge(@Param('id') id: string): Promise<{ message: string }> {
    await this.adminService.deleteBadge(id);
    return { message: 'Badge deleted successfully' };
  }

  @Post('badges/issue')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually issue badge to user' })
  @ApiResponse({ status: 201, description: 'Badge issued' })
  async issueBadge(
    @Body() dto: IssueBadgeDto,
    @CurrentUser('id') adminId: string,
  ): Promise<UserBadge> {
    return this.adminService.issueBadge(dto, adminId);
  }

  // Announcements
  @Get('announcements')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all announcements' })
  @ApiResponse({ status: 200, description: 'Announcements retrieved' })
  async getAnnouncements(): Promise<Announcement[]> {
    return this.adminService.getAnnouncements();
  }

  @Public()
  @Get('announcements/active')
  @ApiOperation({ summary: 'Get active announcements' })
  @ApiResponse({ status: 200, description: 'Active announcements retrieved' })
  async getActiveAnnouncements(): Promise<Announcement[]> {
    return this.adminService.getActiveAnnouncements();
  }

  @Post('announcements')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create announcement' })
  @ApiResponse({ status: 201, description: 'Announcement created' })
  async createAnnouncement(
    @Body() dto: CreateAnnouncementDto,
    @CurrentUser('id') adminId: string,
  ): Promise<Announcement> {
    return this.adminService.createAnnouncement(dto, adminId);
  }

  @Patch('announcements/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update announcement' })
  @ApiResponse({ status: 200, description: 'Announcement updated' })
  async updateAnnouncement(
    @Param('id') id: string,
    @Body() dto: UpdateAnnouncementDto,
  ): Promise<Announcement> {
    return this.adminService.updateAnnouncement(id, dto);
  }

  @Delete('announcements/:id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete announcement' })
  @ApiResponse({ status: 200, description: 'Announcement deleted' })
  async deleteAnnouncement(@Param('id') id: string): Promise<{ message: string }> {
    await this.adminService.deleteAnnouncement(id);
    return { message: 'Announcement deleted successfully' };
  }
}
