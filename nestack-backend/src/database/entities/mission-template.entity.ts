import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { GoalType, CategoryStatus } from '../../common/enums';
import { LifeCycleCategory } from './lifecycle-category.entity';
import { Mission } from './mission.entity';

@Entity('mission_templates')
export class MissionTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => LifeCycleCategory, (category) => category.templates)
  @JoinColumn({ name: 'category_id' })
  category: LifeCycleCategory;

  @Column({
    name: 'goal_type',
    type: 'enum',
    enum: GoalType,
    default: GoalType.AMOUNT,
  })
  goalType: GoalType;

  @Column({
    name: 'default_goal_amount',
    type: 'decimal',
    precision: 18,
    scale: 2,
    nullable: true,
  })
  defaultGoalAmount: number;

  @Column({
    type: 'enum',
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE,
  })
  status: CategoryStatus;

  @Column({ name: 'usage_count', default: 0 })
  usageCount: number;

  @OneToMany(() => Mission, (mission) => mission.template)
  missions: Mission[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
