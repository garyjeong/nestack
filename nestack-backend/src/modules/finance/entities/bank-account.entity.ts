import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ShareStatus } from '../../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Transaction } from './transaction.entity';

@Entity('bank_accounts')
@Index('idx_bank_account_user', ['userId'])
@Index('idx_bank_account_fintech', ['fintechUseNum'])
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.bankAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'bank_code', type: 'varchar', length: 10 })
  bankCode: string;

  @Column({ name: 'bank_name', type: 'varchar', length: 50 })
  bankName: string;

  @Column({ name: 'account_number', type: 'varchar', length: 50 })
  accountNumber: string; // Encrypted

  @Column({ name: 'account_number_masked', type: 'varchar', length: 50 })
  accountNumberMasked: string;

  @Column({ name: 'account_alias', type: 'varchar', length: 100, nullable: true })
  accountAlias: string | null;

  @Column({ name: 'account_type', type: 'varchar', length: 50, nullable: true })
  accountType: string | null;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balance: number;

  @Column({ name: 'fintech_use_num', type: 'varchar', length: 100 })
  fintechUseNum: string;

  @Column({
    name: 'share_status',
    type: 'enum',
    enum: ShareStatus,
    default: ShareStatus.PRIVATE,
  })
  shareStatus: ShareStatus;

  @Column({ name: 'is_hidden', type: 'boolean', default: false })
  isHidden: boolean;

  @Column({ name: 'last_synced_at', type: 'timestamp', nullable: true })
  lastSyncedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Transaction, (transaction) => transaction.bankAccount)
  transactions: Transaction[];
}
