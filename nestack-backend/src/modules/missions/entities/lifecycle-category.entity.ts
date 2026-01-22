import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CategoryStatus } from '../../../common/enums';
import { MissionTemplate } from './mission-template.entity';
import { Mission } from './mission.entity';

@Entity('lifecycle_categories')
export class LifeCycleCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @Column({
    type: 'enum',
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE,
  })
  status: CategoryStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => MissionTemplate, (template) => template.category)
  templates: MissionTemplate[];

  @OneToMany(() => Mission, (mission) => mission.category)
  missions: Mission[];
}
