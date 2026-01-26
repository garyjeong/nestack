import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { BadgeIssueType } from '../../common/enums';
import { User } from './user.entity';
import { Badge } from './badge.entity';

@Entity('user_badges')
export class UserBadge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.userBadges)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'badge_id' })
  badgeId: string;

  @ManyToOne(() => Badge, (badge) => badge.userBadges)
  @JoinColumn({ name: 'badge_id' })
  badge: Badge;

  @Column({
    name: 'issue_type',
    type: 'enum',
    enum: BadgeIssueType,
    default: BadgeIssueType.AUTO,
  })
  issueType: BadgeIssueType;

  @CreateDateColumn({ name: 'issued_at' })
  issuedAt: Date;

  @Column({ name: 'issued_by', nullable: true })
  issuedBy: string;
}
