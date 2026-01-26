import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ShareStatus } from '../../common/enums';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';
import { MissionSharedAccount } from './mission-shared-account.entity';

@Entity('bank_accounts')
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.bankAccounts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'bank_code', length: 10 })
  bankCode: string;

  @Column({ name: 'bank_name', length: 50 })
  bankName: string;

  @Column({ name: 'account_number', length: 50 })
  accountNumber: string;

  @Column({ name: 'account_number_masked', length: 50 })
  accountNumberMasked: string;

  @Column({ name: 'account_alias', nullable: true, length: 100 })
  accountAlias: string;

  @Column({ name: 'account_type', nullable: true, length: 50 })
  accountType: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balance: number;

  @Column({ name: 'fintech_use_num', length: 100 })
  fintechUseNum: string;

  @Column({
    name: 'share_status',
    type: 'enum',
    enum: ShareStatus,
    default: ShareStatus.PRIVATE,
  })
  shareStatus: ShareStatus;

  @Column({ name: 'is_hidden', default: false })
  isHidden: boolean;

  @Column({ name: 'last_synced_at', type: 'timestamp', nullable: true })
  lastSyncedAt: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.bankAccount)
  transactions: Transaction[];

  @OneToMany(() => MissionSharedAccount, (msa) => msa.bankAccount)
  missionSharedAccounts: MissionSharedAccount[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
