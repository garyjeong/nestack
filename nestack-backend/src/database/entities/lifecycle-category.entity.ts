import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CategoryStatus } from '../../common/enums';
import { Mission } from './mission.entity';
import { MissionTemplate } from './mission-template.entity';

@Entity('lifecycle_categories')
export class LifeCycleCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({
    type: 'enum',
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE,
  })
  status: CategoryStatus;

  @OneToMany(() => Mission, (mission) => mission.category)
  missions: Mission[];

  @OneToMany(() => MissionTemplate, (template) => template.category)
  templates: MissionTemplate[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
