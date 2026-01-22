import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('openbanking_tokens')
export class OpenBankingToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'access_token', type: 'text' })
  accessToken: string; // Encrypted

  @Column({ name: 'refresh_token', type: 'text' })
  refreshToken: string; // Encrypted

  @Column({ name: 'token_type', type: 'varchar', length: 50 })
  tokenType: string;

  @Column({ type: 'varchar', length: 255 })
  scope: string;

  @Column({ name: 'user_seq_no', type: 'varchar', length: 50 })
  userSeqNo: string; // Open Banking user sequence number

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
