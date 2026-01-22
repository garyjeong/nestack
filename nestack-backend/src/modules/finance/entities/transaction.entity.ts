import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TransactionType } from '../../../common/enums';
import { BankAccount } from './bank-account.entity';
import { Mission } from '../../missions/entities/mission.entity';

@Entity('transactions')
@Index('idx_transaction_bank_account', ['bankAccountId'])
@Index('idx_transaction_mission', ['missionId'])
@Index('idx_transaction_date', ['transactionDate'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'bank_account_id', type: 'uuid' })
  bankAccountId: string;

  @ManyToOne(() => BankAccount, (bankAccount) => bankAccount.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bank_account_id' })
  bankAccount: BankAccount;

  @Column({ name: 'transaction_id', type: 'varchar', length: 100 })
  transactionId: string; // Open Banking transaction ID

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ name: 'balance_after', type: 'decimal', precision: 18, scale: 2 })
  balanceAfter: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  counterparty: string | null;

  @Column({ name: 'transaction_date', type: 'date' })
  transactionDate: Date;

  @Column({ name: 'transaction_time', type: 'time', nullable: true })
  transactionTime: string | null;

  @Column({ name: 'mission_id', type: 'uuid', nullable: true })
  missionId: string | null;

  @ManyToOne(() => Mission, (mission) => mission.transactions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'mission_id' })
  mission: Mission | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
