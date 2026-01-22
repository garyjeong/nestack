import { Injectable, Logger, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThanOrEqual, Between } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AdminUser } from './entities/admin-user.entity';
import { Announcement } from './entities/announcement.entity';
import { User } from '../modules/users/entities/user.entity';
import { FamilyGroup } from '../modules/family/entities/family-group.entity';
import { Mission } from '../modules/missions/entities/mission.entity';
import { LifeCycleCategory } from '../modules/missions/entities/lifecycle-category.entity';
import { MissionTemplate } from '../modules/missions/entities/mission-template.entity';
import { Badge } from '../modules/badges/entities/badge.entity';
import { UserBadge } from '../modules/badges/entities/user-badge.entity';
import {
  AdminLoginDto,
  AdminLoginResponseDto,
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
  DashboardStatsDto,
} from './dto';
import { AdminStatus, MissionStatus, BadgeIssueType } from '../common/enums';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(AdminUser)
    private readonly adminRepository: Repository<AdminUser>,
    @InjectRepository(Announcement)
    private readonly announcementRepository: Repository<Announcement>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(FamilyGroup)
    private readonly familyGroupRepository: Repository<FamilyGroup>,
    @InjectRepository(Mission)
    private readonly missionRepository: Repository<Mission>,
    @InjectRepository(LifeCycleCategory)
    private readonly categoryRepository: Repository<LifeCycleCategory>,
    @InjectRepository(MissionTemplate)
    private readonly templateRepository: Repository<MissionTemplate>,
    @InjectRepository(Badge)
    private readonly badgeRepository: Repository<Badge>,
    @InjectRepository(UserBadge)
    private readonly userBadgeRepository: Repository<UserBadge>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ==================== Authentication ====================

  async login(loginDto: AdminLoginDto): Promise<AdminLoginResponseDto> {
    const admin = await this.adminRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!admin) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    if (admin.status !== AdminStatus.ACTIVE) {
      throw new UnauthorizedException('비활성화된 관리자 계정입니다.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // Update last login
    await this.adminRepository.update(admin.id, { lastLoginAt: new Date() });

    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      isAdmin: true,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ADMIN_SECRET') ||
        this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '8h',
    });

    return {
      accessToken,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
  }

  // ==================== Dashboard ====================

  async getDashboardStats(): Promise<DashboardStatsDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisMonth,
      totalFamilyGroups,
      totalMissions,
      completedMissions,
      totalBadgesIssued,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { status: 'active' as any } }),
      this.userRepository.count({ where: { createdAt: MoreThanOrEqual(today) } }),
      this.userRepository.count({ where: { createdAt: MoreThanOrEqual(firstDayOfMonth) } }),
      this.familyGroupRepository.count(),
      this.missionRepository.count(),
      this.missionRepository.count({ where: { status: MissionStatus.COMPLETED } }),
      this.userBadgeRepository.count(),
    ]);

    return {
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisMonth,
      totalFamilyGroups,
      totalMissions,
      completedMissions,
      missionCompletionRate: totalMissions > 0
        ? Math.round((completedMissions / totalMissions) * 100)
        : 0,
      totalBadgesIssued,
    };
  }

  // ==================== User Management ====================

  async getUsers(query: UserQueryDto) {
    const { search, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.familyGroup', 'familyGroup')
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (search) {
      queryBuilder.andWhere(
        '(user.email LIKE :search OR user.name LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserStatus(userId: string, dto: UpdateUserStatusDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    user.status = dto.status;
    await this.userRepository.save(user);

    return user;
  }

  // ==================== Category Management ====================

  async getCategories() {
    return this.categoryRepository.find({
      order: { displayOrder: 'ASC' },
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    const category = this.categoryRepository.create(dto);
    return this.categoryRepository.save(category);
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    }

    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async deleteCategory(id: string) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    }

    await this.categoryRepository.remove(category);
  }

  // ==================== Template Management ====================

  async getTemplates() {
    return this.templateRepository.find({
      relations: ['category'],
      order: { usageCount: 'DESC' },
    });
  }

  async createTemplate(dto: CreateTemplateDto) {
    const category = await this.categoryRepository.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    }

    const template = this.templateRepository.create(dto);
    return this.templateRepository.save(template);
  }

  async updateTemplate(id: string, dto: UpdateTemplateDto) {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException('템플릿을 찾을 수 없습니다.');
    }

    if (dto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('카테고리를 찾을 수 없습니다.');
      }
    }

    Object.assign(template, dto);
    return this.templateRepository.save(template);
  }

  async deleteTemplate(id: string) {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException('템플릿을 찾을 수 없습니다.');
    }

    await this.templateRepository.remove(template);
  }

  // ==================== Badge Management ====================

  async getBadges() {
    return this.badgeRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async createBadge(dto: CreateBadgeDto) {
    const badge = this.badgeRepository.create(dto);
    return this.badgeRepository.save(badge);
  }

  async updateBadge(id: string, dto: UpdateBadgeDto) {
    const badge = await this.badgeRepository.findOne({ where: { id } });
    if (!badge) {
      throw new NotFoundException('뱃지를 찾을 수 없습니다.');
    }

    Object.assign(badge, dto);
    return this.badgeRepository.save(badge);
  }

  async deleteBadge(id: string) {
    const badge = await this.badgeRepository.findOne({ where: { id } });
    if (!badge) {
      throw new NotFoundException('뱃지를 찾을 수 없습니다.');
    }

    await this.badgeRepository.remove(badge);
  }

  async issueBadge(adminId: string, dto: IssueBadgeDto) {
    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const badge = await this.badgeRepository.findOne({ where: { id: dto.badgeId } });
    if (!badge) {
      throw new NotFoundException('뱃지를 찾을 수 없습니다.');
    }

    // Check if already issued
    const existing = await this.userBadgeRepository.findOne({
      where: { userId: dto.userId, badgeId: dto.badgeId },
    });
    if (existing) {
      throw new NotFoundException('이미 발급된 뱃지입니다.');
    }

    const userBadge = this.userBadgeRepository.create({
      userId: dto.userId,
      badgeId: dto.badgeId,
      issueType: BadgeIssueType.MANUAL,
      issuedBy: adminId,
    });

    return this.userBadgeRepository.save(userBadge);
  }

  // ==================== Announcement Management ====================

  async getAnnouncements() {
    return this.announcementRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async createAnnouncement(adminId: string, dto: CreateAnnouncementDto) {
    const announcement = this.announcementRepository.create({
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      createdBy: adminId,
    });
    return this.announcementRepository.save(announcement);
  }

  async updateAnnouncement(id: string, dto: UpdateAnnouncementDto) {
    const announcement = await this.announcementRepository.findOne({ where: { id } });
    if (!announcement) {
      throw new NotFoundException('공지사항을 찾을 수 없습니다.');
    }

    if (dto.startDate) {
      announcement.startDate = new Date(dto.startDate);
    }
    if (dto.endDate) {
      announcement.endDate = new Date(dto.endDate);
    }
    if (dto.title) announcement.title = dto.title;
    if (dto.content) announcement.content = dto.content;
    if (dto.displayType) announcement.displayType = dto.displayType;
    if (dto.status) announcement.status = dto.status;

    return this.announcementRepository.save(announcement);
  }

  async deleteAnnouncement(id: string) {
    const announcement = await this.announcementRepository.findOne({ where: { id } });
    if (!announcement) {
      throw new NotFoundException('공지사항을 찾을 수 없습니다.');
    }

    await this.announcementRepository.remove(announcement);
  }

  async getActiveAnnouncements() {
    const now = new Date();
    return this.announcementRepository.find({
      where: {
        status: 'active' as any,
        startDate: Between(new Date(0), now),
        endDate: MoreThanOrEqual(now),
      },
      order: { createdAt: 'DESC' },
    });
  }
}
