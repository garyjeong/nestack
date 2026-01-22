import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Badge, BadgeStatus } from './entities/badge.entity';
import { UserBadge } from './entities/user-badge.entity';
import { Mission } from '../missions/entities/mission.entity';
import { BusinessException } from '../../common/exceptions/business.exception';
import { BadgeType, BadgeIssueType, MissionStatus } from '../../common/enums';

@Injectable()
export class BadgesService {
  private readonly logger = new Logger(BadgesService.name);

  constructor(
    @InjectRepository(Badge)
    private readonly badgeRepository: Repository<Badge>,
    @InjectRepository(UserBadge)
    private readonly userBadgeRepository: Repository<UserBadge>,
    @InjectRepository(Mission)
    private readonly missionRepository: Repository<Mission>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Get all badges
   */
  async getAllBadges(): Promise<Badge[]> {
    return this.badgeRepository.find({
      where: { status: BadgeStatus.ACTIVE },
      order: { badgeType: 'ASC', createdAt: 'ASC' },
    });
  }

  /**
   * Get badge by ID
   */
  async getBadgeById(badgeId: string): Promise<Badge> {
    const badge = await this.badgeRepository.findOne({
      where: { id: badgeId },
    });

    if (!badge) {
      throw new BusinessException('BADGE_001');
    }

    return badge;
  }

  /**
   * Get user's badges
   */
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return this.userBadgeRepository.find({
      where: { userId },
      relations: ['badge'],
      order: { issuedAt: 'DESC' },
    });
  }

  /**
   * Get user's badges with all badges (including unearned)
   */
  async getUserBadgesWithStatus(userId: string): Promise<Array<Badge & { earned: boolean; earnedAt?: Date }>> {
    const allBadges = await this.getAllBadges();
    const userBadges = await this.getUserBadges(userId);

    const userBadgeMap = new Map(userBadges.map((ub) => [ub.badgeId, ub]));

    return allBadges.map((badge) => {
      const userBadge = userBadgeMap.get(badge.id);
      return {
        ...badge,
        earned: !!userBadge,
        earnedAt: userBadge?.issuedAt,
      };
    });
  }

  /**
   * Award badge to user
   */
  async awardBadge(
    userId: string,
    badgeId: string,
    issueType: BadgeIssueType = BadgeIssueType.AUTO,
    issuedBy?: string,
  ): Promise<UserBadge> {
    // Check if badge exists
    const badge = await this.getBadgeById(badgeId);

    // Check if user already has this badge
    const existingBadge = await this.userBadgeRepository.findOne({
      where: { userId, badgeId },
    });

    if (existingBadge) {
      throw new BusinessException('BADGE_002');
    }

    // Award badge
    const userBadge = this.userBadgeRepository.create({
      userId,
      badgeId,
      issueType,
      issuedBy,
    });

    await this.userBadgeRepository.save(userBadge);

    // Emit event
    this.eventEmitter.emit('badge.earned', { userId, badge, userBadge });

    return userBadge;
  }

  /**
   * Check and award badges based on mission completion
   */
  @OnEvent('mission.completed')
  async handleMissionCompleted(payload: { mission: Mission }): Promise<void> {
    const { mission } = payload;

    try {
      await this.checkLifecycleBadges(mission.userId, mission.categoryId);
      await this.checkStreakBadges(mission.userId);
      if (mission.familyGroupId) {
        await this.checkFamilyBadges(mission.userId, mission.familyGroupId);
      }
    } catch (error) {
      this.logger.error('Error checking badges after mission completion', error);
    }
  }

  /**
   * Check lifecycle badges (based on category completion count)
   */
  private async checkLifecycleBadges(userId: string, categoryId: string): Promise<void> {
    // Get all completed missions in this category
    const completedCount = await this.missionRepository.count({
      where: {
        userId,
        categoryId,
        status: MissionStatus.COMPLETED,
      },
    });

    // Find matching lifecycle badges
    const lifecycleBadges = await this.badgeRepository.find({
      where: { badgeType: BadgeType.LIFECYCLE, status: BadgeStatus.ACTIVE },
    });

    for (const badge of lifecycleBadges) {
      const condition = badge.conditionValue;

      // Check if this badge is for this category
      if (condition.categoryId !== categoryId) continue;

      // Check if user meets the completion count
      if (condition.completedCount && completedCount >= condition.completedCount) {
        try {
          await this.awardBadge(userId, badge.id);
          this.logger.log(`Awarded lifecycle badge ${badge.name} to user ${userId}`);
        } catch (error) {
          // Badge already earned, ignore
        }
      }
    }
  }

  /**
   * Check streak badges (based on consecutive mission completions)
   */
  private async checkStreakBadges(userId: string): Promise<void> {
    // Calculate current streak (simplified - would need more complex logic in production)
    // For now, we'll count missions completed in consecutive months

    const now = new Date();
    const missions = await this.missionRepository.find({
      where: { userId, status: MissionStatus.COMPLETED },
      order: { completedAt: 'DESC' },
    });

    // Calculate consecutive months
    let consecutiveMonths = 0;
    let currentMonth = now.getMonth();
    let currentYear = now.getFullYear();

    for (const mission of missions) {
      if (!mission.completedAt) continue;

      const missionMonth = mission.completedAt.getMonth();
      const missionYear = mission.completedAt.getFullYear();

      if (missionMonth === currentMonth && missionYear === currentYear) {
        continue; // Same month, check previous
      }

      // Check if it's the previous month
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      if (missionMonth === prevMonth && missionYear === prevYear) {
        consecutiveMonths++;
        currentMonth = prevMonth;
        currentYear = prevYear;
      } else {
        break; // Streak broken
      }
    }

    // Check streak badges
    const streakBadges = await this.badgeRepository.find({
      where: { badgeType: BadgeType.STREAK, status: BadgeStatus.ACTIVE },
    });

    for (const badge of streakBadges) {
      const condition = badge.conditionValue;

      if (condition.consecutiveMonths && consecutiveMonths >= condition.consecutiveMonths) {
        try {
          await this.awardBadge(userId, badge.id);
          this.logger.log(`Awarded streak badge ${badge.name} to user ${userId}`);
        } catch (error) {
          // Badge already earned, ignore
        }
      }
    }
  }

  /**
   * Check family badges (based on joint family completions)
   */
  private async checkFamilyBadges(userId: string, familyGroupId: string): Promise<void> {
    // Count missions completed by the family group
    const familyCompletedCount = await this.missionRepository.count({
      where: {
        familyGroupId,
        status: MissionStatus.COMPLETED,
      },
    });

    // Check family badges
    const familyBadges = await this.badgeRepository.find({
      where: { badgeType: BadgeType.FAMILY, status: BadgeStatus.ACTIVE },
    });

    for (const badge of familyBadges) {
      const condition = badge.conditionValue;

      if (condition.familyCompletedCount && familyCompletedCount >= condition.familyCompletedCount) {
        try {
          await this.awardBadge(userId, badge.id);
          this.logger.log(`Awarded family badge ${badge.name} to user ${userId}`);
        } catch (error) {
          // Badge already earned, ignore
        }
      }
    }
  }
}
