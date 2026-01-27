import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual, And } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import {
  AdminUser,
  User,
  FamilyGroup,
  Mission,
  LifeCycleCategory,
  MissionTemplate,
  Badge,
  UserBadge,
  Announcement,
} from '../../database/entities';
import {
  UserStatus,
  FamilyStatus,
  MissionStatus,
  CategoryStatus,
  BadgeIssueType,
  AnnouncementStatus,
} from '../../common/enums';
import {
  InvalidCredentialsException,
  UserNotFoundException,
  BadgeNotFoundException,
  CategoryNotFoundException,
  TemplateNotFoundException,
  AnnouncementNotFoundException,
} from '../../common/exceptions/business.exception';
import { comparePassword, hashPassword } from '../../common/utils/crypto.util';
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

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(FamilyGroup)
    private familyGroupRepository: Repository<FamilyGroup>,
    @InjectRepository(Mission)
    private missionRepository: Repository<Mission>,
    @InjectRepository(LifeCycleCategory)
    private categoryRepository: Repository<LifeCycleCategory>,
    @InjectRepository(MissionTemplate)
    private templateRepository: Repository<MissionTemplate>,
    @InjectRepository(Badge)
    private badgeRepository: Repository<Badge>,
    @InjectRepository(UserBadge)
    private userBadgeRepository: Repository<UserBadge>,
    @InjectRepository(Announcement)
    private announcementRepository: Repository<Announcement>,
    private jwtService: JwtService,
  ) {}

  // Auth
  async login(dto: AdminLoginDto): Promise<AdminTokenResponseDto> {
    const admin = await this.adminUserRepository.findOne({
      where: { email: dto.email },
    });

    if (!admin) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await comparePassword(dto.password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    // Update last login
    admin.lastLoginAt = new Date();
    await this.adminUserRepository.save(admin);

    const token = this.jwtService.sign({
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin',
    });

    return {
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: 86400, // 24 hours
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStatsDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      totalFamilyGroups,
      totalMissions,
      completedMissions,
      activeBadges,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { status: UserStatus.ACTIVE } }),
      this.userRepository.count({
        where: { createdAt: MoreThanOrEqual(today) },
      }),
      this.familyGroupRepository.count({
        where: { status: FamilyStatus.ACTIVE },
      }),
      this.missionRepository.count(),
      this.missionRepository.count({
        where: { status: MissionStatus.COMPLETED },
      }),
      this.badgeRepository.count({ where: { status: CategoryStatus.ACTIVE } }),
    ]);

    // Calculate total savings
    const missions = await this.missionRepository.find();
    const totalSavingsAmount = missions.reduce(
      (sum, m) => sum + Number(m.currentAmount),
      0,
    );

    return {
      totalUsers,
      activeUsers,
      newUsersToday,
      totalFamilyGroups,
      totalMissions,
      completedMissions,
      totalSavingsAmount,
      activeBadges,
    };
  }

  // Users
  async getUsers(page = 1, limit = 20): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { users, total };
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UserNotFoundException();
    }

    user.status = status;
    return this.userRepository.save(user);
  }

  // Categories
  async getCategories(): Promise<LifeCycleCategory[]> {
    return this.categoryRepository.find({ order: { displayOrder: 'ASC' } });
  }

  async createCategory(dto: CreateCategoryDto): Promise<LifeCycleCategory> {
    const category = this.categoryRepository.create({
      name: dto.name,
      displayOrder: dto.displayOrder || 0,
      status: CategoryStatus.ACTIVE,
    });
    return this.categoryRepository.save(category);
  }

  async updateCategory(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<LifeCycleCategory> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new CategoryNotFoundException();
    }

    if (dto.name !== undefined) category.name = dto.name;
    if (dto.displayOrder !== undefined) category.displayOrder = dto.displayOrder;
    if (dto.status !== undefined) category.status = dto.status;

    return this.categoryRepository.save(category);
  }

  async deleteCategory(id: string): Promise<void> {
    const result = await this.categoryRepository.delete({ id });
    if (result.affected === 0) {
      throw new CategoryNotFoundException();
    }
  }

  // Templates
  async getTemplates(): Promise<MissionTemplate[]> {
    return this.templateRepository.find({
      relations: ['category'],
      order: { usageCount: 'DESC' },
    });
  }

  async createTemplate(dto: CreateTemplateDto): Promise<MissionTemplate> {
    const template = this.templateRepository.create({
      name: dto.name,
      description: dto.description,
      categoryId: dto.categoryId,
      goalType: dto.goalType,
      defaultGoalAmount: dto.defaultGoalAmount,
      status: CategoryStatus.ACTIVE,
    });
    return this.templateRepository.save(template);
  }

  async updateTemplate(
    id: string,
    dto: UpdateTemplateDto,
  ): Promise<MissionTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new TemplateNotFoundException();
    }

    if (dto.name !== undefined) template.name = dto.name;
    if (dto.description !== undefined) template.description = dto.description;
    if (dto.categoryId !== undefined) template.categoryId = dto.categoryId;
    if (dto.goalType !== undefined) template.goalType = dto.goalType;
    if (dto.defaultGoalAmount !== undefined)
      template.defaultGoalAmount = dto.defaultGoalAmount;
    if (dto.status !== undefined) template.status = dto.status;

    return this.templateRepository.save(template);
  }

  async deleteTemplate(id: string): Promise<void> {
    const result = await this.templateRepository.delete({ id });
    if (result.affected === 0) {
      throw new TemplateNotFoundException();
    }
  }

  // Badges
  async getBadges(): Promise<Badge[]> {
    return this.badgeRepository.find({ order: { badgeType: 'ASC', name: 'ASC' } });
  }

  async createBadge(dto: CreateBadgeDto): Promise<Badge> {
    const badge = this.badgeRepository.create({
      name: dto.name,
      description: dto.description,
      imageUrl: dto.imageUrl,
      badgeType: dto.badgeType,
      conditionType: dto.conditionType,
      conditionValue: dto.conditionValue,
      status: CategoryStatus.ACTIVE,
    });
    return this.badgeRepository.save(badge);
  }

  async updateBadge(id: string, dto: UpdateBadgeDto): Promise<Badge> {
    const badge = await this.badgeRepository.findOne({ where: { id } });
    if (!badge) {
      throw new BadgeNotFoundException();
    }

    if (dto.name !== undefined) badge.name = dto.name;
    if (dto.description !== undefined) badge.description = dto.description;
    if (dto.imageUrl !== undefined) badge.imageUrl = dto.imageUrl;
    if (dto.badgeType !== undefined) badge.badgeType = dto.badgeType;
    if (dto.conditionType !== undefined) badge.conditionType = dto.conditionType;
    if (dto.conditionValue !== undefined) badge.conditionValue = dto.conditionValue;
    if (dto.status !== undefined) badge.status = dto.status;

    return this.badgeRepository.save(badge);
  }

  async deleteBadge(id: string): Promise<void> {
    await this.userBadgeRepository.delete({ badgeId: id });
    await this.badgeRepository.delete({ id });
  }

  async issueBadge(dto: IssueBadgeDto, issuedBy: string): Promise<UserBadge> {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new UserNotFoundException();
    }

    const badge = await this.badgeRepository.findOne({
      where: { id: dto.badgeId },
    });
    if (!badge) {
      throw new BadgeNotFoundException();
    }

    const userBadge = this.userBadgeRepository.create({
      userId: dto.userId,
      badgeId: dto.badgeId,
      issueType: BadgeIssueType.MANUAL,
      issuedBy,
    });

    return this.userBadgeRepository.save(userBadge);
  }

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    return this.announcementRepository.find({
      order: { startDate: 'DESC' },
      relations: ['createdByAdmin'],
    });
  }

  async getActiveAnnouncements(): Promise<Announcement[]> {
    const now = new Date();
    return this.announcementRepository.find({
      where: {
        status: AnnouncementStatus.ACTIVE,
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
      order: { startDate: 'DESC' },
    });
  }

  async createAnnouncement(
    dto: CreateAnnouncementDto,
    createdBy: string,
  ): Promise<Announcement> {
    const announcement = this.announcementRepository.create({
      title: dto.title,
      content: dto.content,
      displayType: dto.displayType,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      status: AnnouncementStatus.ACTIVE,
      createdBy,
    });
    return this.announcementRepository.save(announcement);
  }

  async updateAnnouncement(
    id: string,
    dto: UpdateAnnouncementDto,
  ): Promise<Announcement> {
    const announcement = await this.announcementRepository.findOne({
      where: { id },
    });
    if (!announcement) {
      throw new AnnouncementNotFoundException();
    }

    if (dto.title !== undefined) announcement.title = dto.title;
    if (dto.content !== undefined) announcement.content = dto.content;
    if (dto.displayType !== undefined) announcement.displayType = dto.displayType;
    if (dto.startDate !== undefined)
      announcement.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) announcement.endDate = new Date(dto.endDate);
    if (dto.status !== undefined) announcement.status = dto.status;

    return this.announcementRepository.save(announcement);
  }

  async deleteAnnouncement(id: string): Promise<void> {
    const result = await this.announcementRepository.delete({ id });
    if (result.affected === 0) {
      throw new AnnouncementNotFoundException();
    }
  }
}
