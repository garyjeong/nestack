import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Mission } from './mission.entity';
import { BankAccount } from '../../finance/entities/bank-account.entity';

@Entity('mission_shared_accounts')
@Index('idx_mission_shared_account', ['missionId', 'bankAccountId'])
export class MissionSharedAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'mission_id', type: 'uuid' })
  missionId: string;

  @ManyToOne(() => Mission, (mission) => mission.sharedAccounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'mission_id' })
  mission: Mission;

  @Column({ name: 'bank_account_id', type: 'uuid' })
  bankAccountId: string;

  @ManyToOne(() => BankAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bank_account_id' })
  bankAccount: BankAccount;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
