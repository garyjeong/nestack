import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InviteCodeStatus } from '../../common/enums';
import { FamilyGroup } from './family-group.entity';

@Entity('invite_codes')
export class InviteCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 12 })
  code: string;

  @Column({ name: 'family_group_id' })
  familyGroupId: string;

  @ManyToOne(() => FamilyGroup, (familyGroup) => familyGroup.inviteCodes)
  @JoinColumn({ name: 'family_group_id' })
  familyGroup: FamilyGroup;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'used_by', nullable: true })
  usedBy: string;

  @Column({
    type: 'enum',
    enum: InviteCodeStatus,
    default: InviteCodeStatus.PENDING,
  })
  status: InviteCodeStatus;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'used_at', type: 'timestamp', nullable: true })
  usedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
