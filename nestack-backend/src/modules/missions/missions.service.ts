import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Mission,
  MissionTemplate,
  LifeCycleCategory,
  Transaction,
  User,
} from '../../database/entities';
import {
  MissionStatus,
  MissionType,
  MissionLevel,
  CategoryStatus,
  TransactionType,
} from '../../common/enums';
import {
  MissionNotFoundException,
  UnauthorizedAccessException,
} from '../../common/exceptions/business.exception';
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
import { PaginatedResponse, PaginationMeta } from '../../common/dto/api-response.dto';

@Injectable()
export class MissionsService {
  constructor(
    @InjectRepository(Mission)
    private missionRepository: Repository<Mission>,
    @InjectRepository(MissionTemplate)
    private templateRepository: Repository<MissionTemplate>,
    @InjectRepository(LifeCycleCategory)
    private categoryRepository: Repository<LifeCycleCategory>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getCategories(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.find({
      where: { status: CategoryStatus.ACTIVE },
      order: { displayOrder: 'ASC' },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      displayOrder: cat.displayOrder,
    }));
  }

  async getTemplates(categoryId?: string): Promise<MissionTemplate[]> {
    const where: any = { status: CategoryStatus.ACTIVE };
    if (categoryId) {
      where.categoryId = categoryId;
    }

    return this.templateRepository.find({
      where,
      relations: ['category'],
      order: { usageCount: 'DESC' },
    });
  }

  async createMission(
    userId: string,
    dto: CreateMissionDto,
  ): Promise<MissionResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    const missionData: Partial<Mission> = {
      userId,
      name: dto.name,
      description: dto.description,
      categoryId: dto.categoryId,
      templateId: dto.templateId,
      goalAmount: dto.goalAmount,
      currentAmount: 0,
      missionType: dto.templateId ? MissionType.TEMPLATE : MissionType.CUSTOM,
      missionLevel: dto.parentMissionId ? MissionLevel.SUB : MissionLevel.MAIN,
      status: MissionStatus.PENDING,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      dueDate: new Date(dto.dueDate),
      parentMissionId: dto.parentMissionId,
    };

    // Set family group if sharing is enabled
    if (dto.shareWithFamily && user?.familyGroupId) {
      missionData.familyGroupId = user.familyGroupId;
    }

    const mission = this.missionRepository.create(missionData);
    await this.missionRepository.save(mission);

    // Update template usage count
    if (dto.templateId) {
      await this.templateRepository.increment(
        { id: dto.templateId },
        'usageCount',
        1,
      );
    }

    // Load with relations
    const savedMission = await this.missionRepository.findOne({
      where: { id: mission.id },
      relations: ['category'],
    });

    return MissionResponseDto.fromEntity(savedMission!);
  }

  async getMissions(
    userId: string,
    filters: MissionFilterDto,
  ): Promise<PaginatedResponse<MissionResponseDto>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.missionRepository
      .createQueryBuilder('mission')
      .leftJoinAndSelect('mission.category', 'category')
      .where('mission.user_id = :userId', { userId });

    // Include family missions if user is in a family group
    if (filters.includeFamily && user?.familyGroupId) {
      queryBuilder.orWhere('mission.family_group_id = :familyGroupId', {
        familyGroupId: user.familyGroupId,
      });
    }

    if (filters.categoryId) {
      queryBuilder.andWhere('mission.category_id = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    if (filters.status) {
      queryBuilder.andWhere('mission.status = :status', {
        status: filters.status,
      });
    }

    if (filters.level) {
      queryBuilder.andWhere('mission.mission_level = :level', {
        level: filters.level,
      });
    }

    queryBuilder.orderBy('mission.created_at', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [missions, totalItems] = await queryBuilder.getManyAndCount();

    const data = missions.map((m) => MissionResponseDto.fromEntity(m));
    const meta = new PaginationMeta(page, limit, totalItems);

    return new PaginatedResponse(data, meta);
  }

  async getMissionSummary(userId: string): Promise<MissionSummaryDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    const missions = await this.missionRepository.find({
      where: { userId },
    });

    const totalMissions = missions.length;
    const activeMissions = missions.filter(
      (m) => m.status === MissionStatus.IN_PROGRESS,
    ).length;
    const completedMissions = missions.filter(
      (m) => m.status === MissionStatus.COMPLETED,
    ).length;

    const totalSavedAmount = missions.reduce(
      (sum, m) => sum + Number(m.currentAmount),
      0,
    );
    const totalGoalAmount = missions.reduce(
      (sum, m) => sum + Number(m.goalAmount),
      0,
    );

    const overallProgress =
      totalGoalAmount > 0 ? (totalSavedAmount / totalGoalAmount) * 100 : 0;

    return {
      totalMissions,
      activeMissions,
      completedMissions,
      totalSavedAmount,
      totalGoalAmount,
      overallProgress: Math.min(100, overallProgress),
    };
  }

  async getMission(userId: string, missionId: string): Promise<MissionResponseDto> {
    const mission = await this.findMissionWithAccess(userId, missionId);
    return MissionResponseDto.fromEntity(mission);
  }

  async updateMission(
    userId: string,
    missionId: string,
    dto: UpdateMissionDto,
  ): Promise<MissionResponseDto> {
    const mission = await this.findMissionWithAccess(userId, missionId, true);

    if (dto.name !== undefined) mission.name = dto.name;
    if (dto.description !== undefined) mission.description = dto.description;
    if (dto.goalAmount !== undefined) mission.goalAmount = dto.goalAmount;
    if (dto.startDate !== undefined) mission.startDate = new Date(dto.startDate);
    if (dto.dueDate !== undefined) mission.dueDate = new Date(dto.dueDate);

    if (dto.shareWithFamily !== undefined) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      mission.familyGroupId = dto.shareWithFamily ? user?.familyGroupId : (null as any);
    }

    await this.missionRepository.save(mission);

    return MissionResponseDto.fromEntity(mission);
  }

  async deleteMission(userId: string, missionId: string): Promise<void> {
    const mission = await this.findMissionWithAccess(userId, missionId, true);

    // Unlink transactions
    await this.transactionRepository.update(
      { missionId: mission.id },
      { missionId: null as any },
    );

    await this.missionRepository.delete({ id: mission.id });
  }

  async updateMissionStatus(
    userId: string,
    missionId: string,
    dto: UpdateMissionStatusDto,
  ): Promise<MissionResponseDto> {
    const mission = await this.findMissionWithAccess(userId, missionId, true);

    mission.status = dto.status;

    if (dto.status === MissionStatus.COMPLETED) {
      mission.completedAt = new Date();
    } else if (dto.status === MissionStatus.IN_PROGRESS && !mission.startDate) {
      mission.startDate = new Date();
    }

    await this.missionRepository.save(mission);

    return MissionResponseDto.fromEntity(mission);
  }

  async linkTransactions(
    userId: string,
    missionId: string,
    dto: LinkTransactionsDto,
  ): Promise<MissionResponseDto> {
    const mission = await this.findMissionWithAccess(userId, missionId, true);

    // Link transactions
    await this.transactionRepository.update(
      { id: In(dto.transactionIds) },
      { missionId: mission.id },
    );

    // Recalculate current amount
    const linkedTransactions = await this.transactionRepository.find({
      where: { missionId: mission.id },
    });

    const totalAmount = linkedTransactions
      .filter((t) => t.type === TransactionType.DEPOSIT)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    mission.currentAmount = totalAmount;

    // Auto-complete if goal reached
    if (mission.currentAmount >= mission.goalAmount) {
      mission.status = MissionStatus.COMPLETED;
      mission.completedAt = new Date();
    } else if (mission.status === MissionStatus.PENDING) {
      mission.status = MissionStatus.IN_PROGRESS;
    }

    await this.missionRepository.save(mission);

    return MissionResponseDto.fromEntity(mission);
  }

  private async findMissionWithAccess(
    userId: string,
    missionId: string,
    requireOwnership = false,
  ): Promise<Mission> {
    const mission = await this.missionRepository.findOne({
      where: { id: missionId },
      relations: ['category'],
    });

    if (!mission) {
      throw new MissionNotFoundException();
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    const isOwner = mission.userId === userId;
    const isFamilyMember =
      user?.familyGroupId && mission.familyGroupId === user.familyGroupId;

    if (requireOwnership && !isOwner) {
      throw new UnauthorizedAccessException();
    }

    if (!isOwner && !isFamilyMember) {
      throw new UnauthorizedAccessException();
    }

    return mission;
  }
}
