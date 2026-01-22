import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { GoalType, CategoryStatus } from '../../../common/enums';
import { LifeCycleCategory } from './lifecycle-category.entity';

@Entity('mission_templates')
@Index('idx_mission_template_category', ['categoryId'])
export class MissionTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => LifeCycleCategory, (category) => category.templates, {
    onDelete: 'CASCADE',
  })
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
  defaultGoalAmount: number | null;

  @Column({
    type: 'enum',
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE,
  })
  status: CategoryStatus;

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
