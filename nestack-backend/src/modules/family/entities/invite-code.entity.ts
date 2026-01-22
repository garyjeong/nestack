import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { InviteCodeStatus } from '../../../common/enums';
import { FamilyGroup } from './family-group.entity';

@Entity('invite_codes')
@Index('idx_invite_code_code', ['code'])
@Index('idx_invite_code_family_group', ['familyGroupId'])
export class InviteCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 12, unique: true })
  code: string;

  @Column({ name: 'family_group_id', type: 'uuid' })
  familyGroupId: string;

  @ManyToOne(() => FamilyGroup, (familyGroup) => familyGroup.inviteCodes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'family_group_id' })
  familyGroup: FamilyGroup;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'used_by', type: 'uuid', nullable: true })
  usedBy: string | null;

  @Column({
    type: 'enum',
    enum: InviteCodeStatus,
    default: InviteCodeStatus.PENDING,
  })
  status: InviteCodeStatus;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'used_at', type: 'timestamp', nullable: true })
  usedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
