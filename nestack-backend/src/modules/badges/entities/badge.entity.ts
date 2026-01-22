import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BadgeType } from '../../../common/enums';
import { UserBadge } from './user-badge.entity';

export enum BadgeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface BadgeConditionValue {
  // For lifecycle type
  categoryId?: string;
  completedCount?: number;

  // For streak type
  consecutiveMonths?: number;
  consecutiveWeeks?: number;

  // For family type
  familyCompletedCount?: number;
}

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({
    name: 'badge_type',
    type: 'enum',
    enum: BadgeType,
  })
  badgeType: BadgeType;

  @Column({ name: 'condition_type', type: 'varchar', length: 50 })
  conditionType: string;

  @Column({ name: 'condition_value', type: 'jsonb' })
  conditionValue: BadgeConditionValue;

  @Column({
    type: 'enum',
    enum: BadgeStatus,
    default: BadgeStatus.ACTIVE,
  })
  status: BadgeStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => UserBadge, (userBadge) => userBadge.badge)
  userBadges: UserBadge[];
}
