import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Mission } from './entities/mission.entity';
import { MissionTemplate } from './entities/mission-template.entity';
import { LifeCycleCategory } from './entities/lifecycle-category.entity';
import { Transaction } from '../finance/entities/transaction.entity';
import {
  CreateMissionDto,
  UpdateMissionDto,
  UpdateMissionStatusDto,
  MissionQueryDto,
  LinkTransactionDto,
} from './dto';
import { BusinessException } from '../../common/exceptions/business.exception';
import { MissionStatus, MissionType, MissionLevel, CategoryStatus } from '../../common/enums';

@Injectable()
export class MissionsService {
  private readonly logger = new Logger(MissionsService.name);

  constructor(
    @InjectRepository(Mission)
    private readonly missionRepository: Repository<Mission>,
    @InjectRepository(MissionTemplate)
    private readonly templateRepository: Repository<MissionTemplate>,
    @InjectRepository(LifeCycleCategory)
    private readonly categoryRepository: Repository<LifeCycleCategory>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Get all active categories
   */
  async getCategories(): Promise<LifeCycleCategory[]> {
    return this.categoryRepository.find({
      where: { status: CategoryStatus.ACTIVE },
      order: { displayOrder: 'ASC' },
    });
  }

  /**
   * Get templates by category
   */
  async getTemplates(categoryId?: string): Promise<MissionTemplate[]> {
    const where: FindOptionsWhere<MissionTemplate> = {
      status: CategoryStatus.ACTIVE,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    return this.templateRepository.find({
      where,
      relations: ['category'],
      order: { usageCount: 'DESC' },
    });
  }

  /**
   * Create a new mission
   */
  async create(userId: string, createMissionDto: CreateMissionDto, familyGroupId?: string | null): Promise<Mission> {
    // Validate category
    const category = await this.categoryRepository.findOne({
      where: { id: createMissionDto.categoryId },
    });

    if (!category) {
      throw new BusinessException('MISSION_001', {
        message: '유효하지 않은 카테고리입니다.',
      });
    }

    // Validate template if provided
    let template: MissionTemplate | null = null;
    if (createMissionDto.templateId) {
      template = await this.templateRepository.findOne({
        where: { id: createMissionDto.templateId },
      });

      if (!template) {
        throw new BusinessException('MISSION_002', {
          message: '유효하지 않은 템플릿입니다.',
        });
      }

      // Increment template usage
      await this.templateRepository.update(template.id, {
        usageCount: () => 'usage_count + 1',
      });
    }

    // Validate parent mission if provided
    if (createMissionDto.parentMissionId) {
      const parentMission = await this.missionRepository.findOne({
        where: { id: createMissionDto.parentMissionId, userId },
      });

      if (!parentMission) {
        throw new BusinessException('MISSION_003', {
          message: '유효하지 않은 상위 미션입니다.',
        });
      }
    }

    // Create mission
    const mission = this.missionRepository.create({
      userId,
      familyGroupId,
      templateId: createMissionDto.templateId,
      categoryId: createMissionDto.categoryId,
      parentMissionId: createMissionDto.parentMissionId,
      name: createMissionDto.name,
      description: createMissionDto.description,
      goalAmount: createMissionDto.goalAmount,
      missionType: createMissionDto.missionType || (template ? MissionType.TEMPLATE : MissionType.CUSTOM),
      missionLevel: createMissionDto.missionLevel || MissionLevel.MAIN,
      startDate: createMissionDto.startDate ? new Date(createMissionDto.startDate) : null,
      dueDate: new Date(createMissionDto.dueDate),
      status: MissionStatus.PENDING,
    });

    await this.missionRepository.save(mission);

    // Emit event
    this.eventEmitter.emit('mission.created', { mission, userId });

    return this.findById(mission.id, userId);
  }

  /**
   * Get missions for a user
   */
  async findAll(userId: string, query: MissionQueryDto, familyGroupId?: string | null): Promise<Mission[]> {
    const where: FindOptionsWhere<Mission> = { userId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.level) {
      where.missionLevel = query.level;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.parentMissionId) {
      where.parentMissionId = query.parentMissionId;
    } else if (!query.parentMissionId && !query.level) {
      // By default, only return main missions
      where.parentMissionId = undefined;
    }

    return this.missionRepository.find({
      where,
      relations: ['category', 'template', 'subMissions'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get mission by ID
   */
  async findById(missionId: string, userId: string): Promise<Mission> {
    const mission = await this.missionRepository.findOne({
      where: { id: missionId, userId },
      relations: ['category', 'template', 'subMissions', 'transactions'],
    });

    if (!mission) {
      throw new BusinessException('MISSION_004', {
        message: '미션을 찾을 수 없습니다.',
      });
    }

    return mission;
  }

  /**
   * Update mission
   */
  async update(missionId: string, userId: string, updateMissionDto: UpdateMissionDto): Promise<Mission> {
    const mission = await this.findById(missionId, userId);

    // Don't allow updates to completed missions
    if (mission.status === MissionStatus.COMPLETED) {
      throw new BusinessException('MISSION_005', {
        message: '완료된 미션은 수정할 수 없습니다.',
      });
    }

    // Update fields
    if (updateMissionDto.name) mission.name = updateMissionDto.name;
    if (updateMissionDto.description !== undefined) mission.description = updateMissionDto.description;
    if (updateMissionDto.goalAmount !== undefined) mission.goalAmount = updateMissionDto.goalAmount;
    if (updateMissionDto.startDate) mission.startDate = new Date(updateMissionDto.startDate);
    if (updateMissionDto.dueDate) mission.dueDate = new Date(updateMissionDto.dueDate);

    await this.missionRepository.save(mission);

    // Emit event
    this.eventEmitter.emit('mission.updated', { mission, userId });

    return this.findById(missionId, userId);
  }

  /**
   * Update mission status
   */
  async updateStatus(
    missionId: string,
    userId: string,
    updateStatusDto: UpdateMissionStatusDto,
  ): Promise<Mission> {
    const mission = await this.findById(missionId, userId);

    const newStatus = updateStatusDto.status;

    // Validate status transition
    if (!this.isValidStatusTransition(mission.status, newStatus)) {
      throw new BusinessException('MISSION_006', {
        message: `${mission.status}에서 ${newStatus}로 상태를 변경할 수 없습니다.`,
      });
    }

    mission.status = newStatus;

    // Set completion date if completed
    if (newStatus === MissionStatus.COMPLETED) {
      mission.completedAt = new Date();
    }

    await this.missionRepository.save(mission);

    // Emit event
    this.eventEmitter.emit('mission.statusChanged', {
      mission,
      userId,
      oldStatus: mission.status,
      newStatus,
    });

    return this.findById(missionId, userId);
  }

  /**
   * Delete mission
   */
  async delete(missionId: string, userId: string): Promise<void> {
    const mission = await this.findById(missionId, userId);

    // Cascade delete sub-missions
    await this.missionRepository.delete({ id: missionId });

    // Emit event
    this.eventEmitter.emit('mission.deleted', { missionId, userId });
  }

  /**
   * Link transactions to mission
   */
  async linkTransactions(
    missionId: string,
    userId: string,
    linkDto: LinkTransactionDto,
  ): Promise<Mission> {
    const mission = await this.findById(missionId, userId);

    // Find transactions and link them
    const transactions = await this.transactionRepository.find({
      where: linkDto.transactionIds.map((id) => ({ id })),
    });

    if (transactions.length !== linkDto.transactionIds.length) {
      throw new BusinessException('MISSION_007', {
        message: '일부 거래를 찾을 수 없습니다.',
      });
    }

    // Update transactions with mission ID
    await this.transactionRepository.update(linkDto.transactionIds, {
      missionId: mission.id,
    });

    // Recalculate current amount
    await this.recalculateMissionAmount(mission.id);

    return this.findById(missionId, userId);
  }

  /**
   * Recalculate mission current amount from linked transactions
   */
  async recalculateMissionAmount(missionId: string): Promise<void> {
    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.mission_id = :missionId', { missionId })
      .andWhere("transaction.type = 'deposit'")
      .getRawOne();

    const currentAmount = parseFloat(result?.total || '0');

    await this.missionRepository.update(missionId, { currentAmount });

    // Check if mission is complete
    const mission = await this.missionRepository.findOne({
      where: { id: missionId },
    });

    if (mission && currentAmount >= Number(mission.goalAmount) && mission.status === MissionStatus.IN_PROGRESS) {
      // Auto-complete mission
      mission.status = MissionStatus.COMPLETED;
      mission.completedAt = new Date();
      await this.missionRepository.save(mission);

      this.eventEmitter.emit('mission.completed', { mission });
    }
  }

  /**
   * Get mission progress summary
   */
  async getProgressSummary(userId: string, familyGroupId?: string | null): Promise<{
    totalMissions: number;
    activeMissions: number;
    completedMissions: number;
    totalGoalAmount: number;
    totalCurrentAmount: number;
    overallProgress: number;
  }> {
    const missions = await this.missionRepository.find({
      where: { userId, missionLevel: MissionLevel.MAIN },
    });

    const activeMissions = missions.filter((m) => m.status === MissionStatus.IN_PROGRESS);
    const completedMissions = missions.filter((m) => m.status === MissionStatus.COMPLETED);

    const totalGoalAmount = missions.reduce((sum, m) => sum + Number(m.goalAmount), 0);
    const totalCurrentAmount = missions.reduce((sum, m) => sum + Number(m.currentAmount), 0);

    return {
      totalMissions: missions.length,
      activeMissions: activeMissions.length,
      completedMissions: completedMissions.length,
      totalGoalAmount,
      totalCurrentAmount,
      overallProgress: totalGoalAmount > 0 ? Math.round((totalCurrentAmount / totalGoalAmount) * 100) : 0,
    };
  }

  // ==================== Private Helper Methods ====================

  /**
   * Validate status transition
   */
  private isValidStatusTransition(currentStatus: MissionStatus, newStatus: MissionStatus): boolean {
    const validTransitions: Record<MissionStatus, MissionStatus[]> = {
      [MissionStatus.PENDING]: [MissionStatus.IN_PROGRESS, MissionStatus.FAILED],
      [MissionStatus.IN_PROGRESS]: [MissionStatus.COMPLETED, MissionStatus.FAILED, MissionStatus.PENDING],
      [MissionStatus.COMPLETED]: [],
      [MissionStatus.FAILED]: [MissionStatus.PENDING],
    };

    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  }
}
