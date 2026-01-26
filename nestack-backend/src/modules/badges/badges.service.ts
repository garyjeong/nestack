import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge, UserBadge, User, Mission } from '../../database/entities';
import {
  CategoryStatus,
  BadgeConditionType,
  BadgeIssueType,
  MissionStatus,
} from '../../common/enums';
import { BadgeNotFoundException } from '../../common/exceptions/business.exception';
import { BadgeResponseDto, UserBadgeResponseDto } from './dto';

@Injectable()
export class BadgesService {
  private readonly logger = new Logger(BadgesService.name);

  constructor(
    @InjectRepository(Badge)
    private badgeRepository: Repository<Badge>,
    @InjectRepository(UserBadge)
    private userBadgeRepository: Repository<UserBadge>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Mission)
    private missionRepository: Repository<Mission>,
  ) {}

  async getAllBadges(userId: string): Promise<BadgeResponseDto[]> {
    const badges = await this.badgeRepository.find({
      where: { status: CategoryStatus.ACTIVE },
      order: { badgeType: 'ASC', name: 'ASC' },
    });

    const userBadges = await this.userBadgeRepository.find({
      where: { userId },
    });

    const userBadgeMap = new Map(userBadges.map((ub) => [ub.badgeId, ub]));

    return badges.map((badge) =>
      BadgeResponseDto.fromEntity(badge, userBadgeMap.get(badge.id)),
    );
  }

  async getMyBadges(userId: string): Promise<UserBadgeResponseDto[]> {
    const userBadges = await this.userBadgeRepository.find({
      where: { userId },
      relations: ['badge'],
      order: { issuedAt: 'DESC' },
    });

    return userBadges.map((ub) => UserBadgeResponseDto.fromEntity(ub));
  }

  async getBadge(userId: string, badgeId: string): Promise<BadgeResponseDto> {
    const badge = await this.badgeRepository.findOne({
      where: { id: badgeId },
    });

    if (!badge) {
      throw new BadgeNotFoundException();
    }

    const userBadge = await this.userBadgeRepository.findOne({
      where: { userId, badgeId },
    });

    return BadgeResponseDto.fromEntity(badge, userBadge ?? undefined);
  }

  // Auto-issue badges based on conditions
  async checkAndIssueBadges(userId: string): Promise<UserBadgeResponseDto[]> {
    const newBadges: UserBadgeResponseDto[] = [];

    // Get all badges that user doesn't have
    const allBadges = await this.badgeRepository.find({
      where: { status: CategoryStatus.ACTIVE },
    });

    const existingBadges = await this.userBadgeRepository.find({
      where: { userId },
      select: ['badgeId'],
    });

    const existingBadgeIds = new Set(existingBadges.map((b) => b.badgeId));
    const unearned = allBadges.filter((b) => !existingBadgeIds.has(b.id));

    for (const badge of unearned) {
      const shouldIssue = await this.checkBadgeCondition(userId, badge);
      if (shouldIssue) {
        const userBadge = await this.issueBadge(userId, badge.id);
        newBadges.push(userBadge);
      }
    }

    return newBadges;
  }

  private async checkBadgeCondition(
    userId: string,
    badge: Badge,
  ): Promise<boolean> {
    const { conditionType, conditionValue } = badge;

    switch (conditionType) {
      case BadgeConditionType.MISSION_COMPLETE:
        return this.checkMissionComplete(userId, conditionValue);

      case BadgeConditionType.SAVINGS_AMOUNT:
        return this.checkSavingsAmount(userId, conditionValue);

      case BadgeConditionType.FIRST_ACTION:
        return this.checkFirstAction(userId, conditionValue);

      case BadgeConditionType.CATEGORY_COMPLETE:
        return this.checkCategoryComplete(userId, conditionValue);

      default:
        return false;
    }
  }

  private async checkMissionComplete(
    userId: string,
    condition: any,
  ): Promise<boolean> {
    const requiredCount = condition.count || 1;

    const completedCount = await this.missionRepository.count({
      where: { userId, status: MissionStatus.COMPLETED },
    });

    return completedCount >= requiredCount;
  }

  private async checkSavingsAmount(
    userId: string,
    condition: any,
  ): Promise<boolean> {
    const requiredAmount = condition.amount || 0;

    const missions = await this.missionRepository.find({
      where: { userId },
    });

    const totalSaved = missions.reduce(
      (sum, m) => sum + Number(m.currentAmount),
      0,
    );

    return totalSaved >= requiredAmount;
  }

  private async checkFirstAction(
    userId: string,
    condition: any,
  ): Promise<boolean> {
    const actionType = condition.actionType;

    switch (actionType) {
      case 'mission':
        const missionCount = await this.missionRepository.count({
          where: { userId },
        });
        return missionCount >= 1;

      case 'family':
        const user = await this.userRepository.findOne({
          where: { id: userId },
        });
        return !!user?.familyGroupId;

      default:
        return false;
    }
  }

  private async checkCategoryComplete(
    userId: string,
    condition: any,
  ): Promise<boolean> {
    const categoryId = condition.categoryId;

    const completedInCategory = await this.missionRepository.count({
      where: {
        userId,
        categoryId,
        status: MissionStatus.COMPLETED,
      },
    });

    return completedInCategory >= 1;
  }

  private async issueBadge(
    userId: string,
    badgeId: string,
  ): Promise<UserBadgeResponseDto> {
    const userBadge = this.userBadgeRepository.create({
      userId,
      badgeId,
      issueType: BadgeIssueType.AUTO,
    });

    await this.userBadgeRepository.save(userBadge);

    const saved = await this.userBadgeRepository.findOne({
      where: { id: userBadge.id },
      relations: ['badge'],
    });

    this.logger.log(`Badge ${badgeId} issued to user ${userId}`);

    return UserBadgeResponseDto.fromEntity(saved!);
  }
}
