import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { MissionStatus, MissionType, MissionLevel } from '../../common/enums';
import { User } from './user.entity';
import { FamilyGroup } from './family-group.entity';
import { MissionTemplate } from './mission-template.entity';
import { LifeCycleCategory } from './lifecycle-category.entity';
import { Transaction } from './transaction.entity';
import { MissionSharedAccount } from './mission-shared-account.entity';

@Entity('missions')
export class Mission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.missions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'family_group_id', nullable: true })
  familyGroupId: string;

  @ManyToOne(() => FamilyGroup, (familyGroup) => familyGroup.missions, {
    nullable: true,
  })
  @JoinColumn({ name: 'family_group_id' })
  familyGroup: FamilyGroup;

  @Column({ name: 'template_id', nullable: true })
  templateId: string;

  @ManyToOne(() => MissionTemplate, (template) => template.missions, {
    nullable: true,
  })
  @JoinColumn({ name: 'template_id' })
  template: MissionTemplate;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => LifeCycleCategory, (category) => category.missions)
  @JoinColumn({ name: 'category_id' })
  category: LifeCycleCategory;

  @Column({ name: 'parent_mission_id', nullable: true })
  parentMissionId: string;

  @ManyToOne(() => Mission, (mission) => mission.subMissions, {
    nullable: true,
  })
  @JoinColumn({ name: 'parent_mission_id' })
  parentMission: Mission;

  @OneToMany(() => Mission, (mission) => mission.parentMission)
  subMissions: Mission[];

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    name: 'goal_amount',
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
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
    default: MissionType.CUSTOM,
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
  startDate: Date;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.mission)
  transactions: Transaction[];

  @OneToMany(() => MissionSharedAccount, (msa) => msa.mission)
  sharedAccounts: MissionSharedAccount[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual properties
  get progress(): number {
    if (!this.goalAmount || this.goalAmount === 0) return 0;
    return Math.min(100, (Number(this.currentAmount) / Number(this.goalAmount)) * 100);
  }

  get daysRemaining(): number {
    const today = new Date();
    const due = new Date(this.dueDate);
    const diff = due.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}
