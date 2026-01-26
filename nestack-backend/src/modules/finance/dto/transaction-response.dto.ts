import { ApiProperty } from '@nestjs/swagger';
import { Transaction } from '../../../database/entities';
import { TransactionType } from '../../../common/enums';

export class TransactionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bankAccountId: string;

  @ApiProperty()
  transactionId: string;

  @ApiProperty({ enum: TransactionType })
  type: TransactionType;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  balanceAfter: number;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  counterparty?: string;

  @ApiProperty()
  transactionDate: Date;

  @ApiProperty({ required: false })
  transactionTime?: string;

  @ApiProperty({ required: false })
  missionId?: string;

  static fromEntity(transaction: Transaction): TransactionResponseDto {
    return {
      id: transaction.id,
      bankAccountId: transaction.bankAccountId,
      transactionId: transaction.transactionId,
      type: transaction.type,
      amount: Number(transaction.amount),
      balanceAfter: Number(transaction.balanceAfter),
      description: transaction.description,
      counterparty: transaction.counterparty,
      transactionDate: transaction.transactionDate,
      transactionTime: transaction.transactionTime,
      missionId: transaction.missionId,
    };
  }
}
