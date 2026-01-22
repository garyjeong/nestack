import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { FamilyGroupStatus } from '../../../common/enums';
import { User } from '../../users/entities/user.entity';
import { InviteCode } from './invite-code.entity';
import { Mission } from '../../missions/entities/mission.entity';

@Entity('family_groups')
export class FamilyGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({
    type: 'enum',
    enum: FamilyGroupStatus,
    default: FamilyGroupStatus.ACTIVE,
  })
  status: FamilyGroupStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => User, (user) => user.familyGroup)
  members: User[];

  @OneToMany(() => InviteCode, (inviteCode) => inviteCode.familyGroup)
  inviteCodes: InviteCode[];

  @OneToMany(() => Mission, (mission) => mission.familyGroup)
  missions: Mission[];
}
