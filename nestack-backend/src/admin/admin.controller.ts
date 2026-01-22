import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminJwtGuard } from './guards/admin-jwt.guard';
import { Public, AdminRoute } from '../common/decorators';
import {
  AdminLoginDto,
  UserQueryDto,
  UpdateUserStatusDto,
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

@ApiTags('Admin')
@Controller({ path: 'admin', version: '1' })
@AdminRoute()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==================== Authentication ====================

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '관리자 로그인' })
  async login(@Body() loginDto: AdminLoginDto) {
    return this.adminService.login(loginDto);
  }

  // ==================== Dashboard ====================

  @UseGuards(AdminJwtGuard)
  @Get('dashboard')
  @ApiBearerAuth()
  @ApiOperation({ summary: '대시보드 통계' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  // ==================== User Management ====================

  @UseGuards(AdminJwtGuard)
  @Get('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 목록 조회' })
  async getUsers(@Query() query: UserQueryDto) {
    return this.adminService.getUsers(query);
  }

  @UseGuards(AdminJwtGuard)
  @Patch('users/:id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 상태 변경' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(id, dto);
  }

  // ==================== Category Management ====================

  @UseGuards(AdminJwtGuard)
  @Get('categories')
  @ApiBearerAuth()
  @ApiOperation({ summary: '카테고리 목록 조회' })
  async getCategories() {
    return this.adminService.getCategories();
  }

  @UseGuards(AdminJwtGuard)
  @Post('categories')
  @ApiBearerAuth()
  @ApiOperation({ summary: '카테고리 생성' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.adminService.createCategory(dto);
  }

  @UseGuards(AdminJwtGuard)
  @Patch('categories/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '카테고리 수정' })
  async updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.adminService.updateCategory(id, dto);
  }

  @UseGuards(AdminJwtGuard)
  @Delete('categories/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '카테고리 삭제' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(@Param('id') id: string) {
    await this.adminService.deleteCategory(id);
  }

  // ==================== Template Management ====================

  @UseGuards(AdminJwtGuard)
  @Get('templates')
  @ApiBearerAuth()
  @ApiOperation({ summary: '템플릿 목록 조회' })
  async getTemplates() {
    return this.adminService.getTemplates();
  }

  @UseGuards(AdminJwtGuard)
  @Post('templates')
  @ApiBearerAuth()
  @ApiOperation({ summary: '템플릿 생성' })
  async createTemplate(@Body() dto: CreateTemplateDto) {
    return this.adminService.createTemplate(dto);
  }

  @UseGuards(AdminJwtGuard)
  @Patch('templates/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '템플릿 수정' })
  async updateTemplate(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.adminService.updateTemplate(id, dto);
  }

  @UseGuards(AdminJwtGuard)
  @Delete('templates/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '템플릿 삭제' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTemplate(@Param('id') id: string) {
    await this.adminService.deleteTemplate(id);
  }

  // ==================== Badge Management ====================

  @UseGuards(AdminJwtGuard)
  @Get('badges')
  @ApiBearerAuth()
  @ApiOperation({ summary: '뱃지 목록 조회' })
  async getBadges() {
    return this.adminService.getBadges();
  }

  @UseGuards(AdminJwtGuard)
  @Post('badges')
  @ApiBearerAuth()
  @ApiOperation({ summary: '뱃지 생성' })
  async createBadge(@Body() dto: CreateBadgeDto) {
    return this.adminService.createBadge(dto);
  }

  @UseGuards(AdminJwtGuard)
  @Patch('badges/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '뱃지 수정' })
  async updateBadge(@Param('id') id: string, @Body() dto: UpdateBadgeDto) {
    return this.adminService.updateBadge(id, dto);
  }

  @UseGuards(AdminJwtGuard)
  @Delete('badges/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '뱃지 삭제' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBadge(@Param('id') id: string) {
    await this.adminService.deleteBadge(id);
  }

  @UseGuards(AdminJwtGuard)
  @Post('badges/issue')
  @ApiBearerAuth()
  @ApiOperation({ summary: '뱃지 수동 발급' })
  async issueBadge(@Request() req: any, @Body() dto: IssueBadgeDto) {
    return this.adminService.issueBadge(req.admin.sub, dto);
  }

  // ==================== Announcement Management ====================

  @UseGuards(AdminJwtGuard)
  @Get('announcements')
  @ApiBearerAuth()
  @ApiOperation({ summary: '공지사항 목록 조회' })
  async getAnnouncements() {
    return this.adminService.getAnnouncements();
  }

  @UseGuards(AdminJwtGuard)
  @Post('announcements')
  @ApiBearerAuth()
  @ApiOperation({ summary: '공지사항 생성' })
  async createAnnouncement(@Request() req: any, @Body() dto: CreateAnnouncementDto) {
    return this.adminService.createAnnouncement(req.admin.sub, dto);
  }

  @UseGuards(AdminJwtGuard)
  @Patch('announcements/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '공지사항 수정' })
  async updateAnnouncement(
    @Param('id') id: string,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    return this.adminService.updateAnnouncement(id, dto);
  }

  @UseGuards(AdminJwtGuard)
  @Delete('announcements/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '공지사항 삭제' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAnnouncement(@Param('id') id: string) {
    await this.adminService.deleteAnnouncement(id);
  }

  // ==================== Public Announcements ====================

  @Public()
  @Get('announcements/active')
  @ApiOperation({ summary: '활성 공지사항 조회 (공개)' })
  async getActiveAnnouncements() {
    return this.adminService.getActiveAnnouncements();
  }
}
