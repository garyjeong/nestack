import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Mission } from './mission.entity';
import { BankAccount } from './bank-account.entity';

@Entity('mission_shared_accounts')
export class MissionSharedAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'mission_id' })
  missionId: string;

  @ManyToOne(() => Mission, (mission) => mission.sharedAccounts)
  @JoinColumn({ name: 'mission_id' })
  mission: Mission;

  @Column({ name: 'bank_account_id' })
  bankAccountId: string;

  @ManyToOne(() => BankAccount, (account) => account.missionSharedAccounts)
  @JoinColumn({ name: 'bank_account_id' })
  bankAccount: BankAccount;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
