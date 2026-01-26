import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AnnouncementDisplayType, AnnouncementStatus } from '../../common/enums';
import { AdminUser } from './admin-user.entity';

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    name: 'display_type',
    type: 'enum',
    enum: AnnouncementDisplayType,
    default: AnnouncementDisplayType.BANNER,
  })
  displayType: AnnouncementDisplayType;

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: AnnouncementStatus,
    default: AnnouncementStatus.ACTIVE,
  })
  status: AnnouncementStatus;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => AdminUser, (admin) => admin.announcements)
  @JoinColumn({ name: 'created_by' })
  createdByAdmin: AdminUser;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
