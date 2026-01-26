import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TransactionType } from '../../common/enums';
import { BankAccount } from './bank-account.entity';
import { Mission } from './mission.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'bank_account_id' })
  bankAccountId: string;

  @ManyToOne(() => BankAccount, (account) => account.transactions)
  @JoinColumn({ name: 'bank_account_id' })
  bankAccount: BankAccount;

  @Column({ name: 'transaction_id', length: 100 })
  transactionId: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.DEPOSIT,
  })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  amount: number;

  @Column({
    name: 'balance_after',
    type: 'decimal',
    precision: 18,
    scale: 2,
    default: 0,
  })
  balanceAfter: number;

  @Column({ nullable: true, length: 255 })
  description: string;

  @Column({ nullable: true, length: 100 })
  counterparty: string;

  @Column({ name: 'transaction_date', type: 'date' })
  transactionDate: Date;

  @Column({ name: 'transaction_time', type: 'time', nullable: true })
  transactionTime: string;

  @Column({ name: 'mission_id', nullable: true })
  missionId: string;

  @ManyToOne(() => Mission, (mission) => mission.transactions, {
    nullable: true,
  })
  @JoinColumn({ name: 'mission_id' })
  mission: Mission;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
