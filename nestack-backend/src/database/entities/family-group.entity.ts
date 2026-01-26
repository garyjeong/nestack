import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { FamilyStatus } from '../../common/enums';
import { User } from './user.entity';
import { InviteCode } from './invite-code.entity';
import { Mission } from './mission.entity';

@Entity('family_groups')
export class FamilyGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({
    type: 'enum',
    enum: FamilyStatus,
    default: FamilyStatus.ACTIVE,
  })
  status: FamilyStatus;

  @OneToMany(() => User, (user) => user.familyGroup)
  members: User[];

  @OneToMany(() => InviteCode, (inviteCode) => inviteCode.familyGroup)
  inviteCodes: InviteCode[];

  @OneToMany(() => Mission, (mission) => mission.familyGroup)
  missions: Mission[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
