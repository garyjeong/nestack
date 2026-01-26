import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BadgeType, BadgeConditionType, CategoryStatus } from '../../common/enums';
import { UserBadge } from './user-badge.entity';

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'image_url', nullable: true, length: 500 })
  imageUrl: string;

  @Column({
    name: 'badge_type',
    type: 'enum',
    enum: BadgeType,
    default: BadgeType.LIFECYCLE,
  })
  badgeType: BadgeType;

  @Column({
    name: 'condition_type',
    type: 'enum',
    enum: BadgeConditionType,
  })
  conditionType: BadgeConditionType;

  @Column({
    name: 'condition_value',
    type: 'jsonb',
    default: '{}',
  })
  conditionValue: Record<string, any>;

  @Column({
    type: 'enum',
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE,
  })
  status: CategoryStatus;

  @OneToMany(() => UserBadge, (userBadge) => userBadge.badge)
  userBadges: UserBadge[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
