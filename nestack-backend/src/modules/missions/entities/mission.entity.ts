import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { MissionStatus, MissionType, MissionLevel } from '../../../common/enums';
import { User } from '../../users/entities/user.entity';
import { FamilyGroup } from '../../family/entities/family-group.entity';
import { LifeCycleCategory } from './lifecycle-category.entity';
import { MissionTemplate } from './mission-template.entity';
import { Transaction } from '../../finance/entities/transaction.entity';
import { MissionSharedAccount } from './mission-shared-account.entity';

@Entity('missions')
@Index('idx_mission_user', ['userId'])
@Index('idx_mission_family_group', ['familyGroupId'])
@Index('idx_mission_parent', ['parentMissionId'])
@Index('idx_mission_status', ['status'])
export class Mission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.missions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'family_group_id', type: 'uuid', nullable: true })
  familyGroupId: string | null;

  @ManyToOne(() => FamilyGroup, (familyGroup) => familyGroup.missions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'family_group_id' })
  familyGroup: FamilyGroup | null;

  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  templateId: string | null;

  @ManyToOne(() => MissionTemplate, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'template_id' })
  template: MissionTemplate | null;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => LifeCycleCategory, (category) => category.missions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: LifeCycleCategory;

  @Column({ name: 'parent_mission_id', type: 'uuid', nullable: true })
  parentMissionId: string | null;

  @ManyToOne(() => Mission, (mission) => mission.subMissions, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_mission_id' })
  parentMission: Mission | null;

  @OneToMany(() => Mission, (mission) => mission.parentMission)
  subMissions: Mission[];

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'goal_amount', type: 'decimal', precision: 18, scale: 2 })
  goalAmount: number;

  @Column({
    name: 'current_amount',
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  currentAmount: number;

  @Column({
    name: 'mission_type',
    type: 'enum',
    enum: MissionType,
  })
  missionType: MissionType;

  @Column({
    name: 'mission_level',
    type: 'enum',
    enum: MissionLevel,
    default: MissionLevel.MAIN,
  })
  missionLevel: MissionLevel;

  @Column({
    type: 'enum',
    enum: MissionStatus,
    default: MissionStatus.PENDING,
  })
  status: MissionStatus;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Transaction, (transaction) => transaction.mission)
  transactions: Transaction[];

  @OneToMany(() => MissionSharedAccount, (shared) => shared.mission)
  sharedAccounts: MissionSharedAccount[];

  // Computed property
  get progressPercent(): number {
    if (Number(this.goalAmount) === 0) return 0;
    return Math.min(
      100,
      Math.round((Number(this.currentAmount) / Number(this.goalAmount)) * 100),
    );
  }
}
