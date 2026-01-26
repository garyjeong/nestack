import { ApiProperty } from '@nestjs/swagger';
import { BankAccount } from '../../../database/entities';
import { ShareStatus } from '../../../common/enums';

export class AccountResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bankCode: string;

  @ApiProperty()
  bankName: string;

  @ApiProperty()
  accountNumberMasked: string;

  @ApiProperty({ required: false })
  accountAlias?: string;

  @ApiProperty({ required: false })
  accountType?: string;

  @ApiProperty()
  balance: number;

  @ApiProperty({ enum: ShareStatus })
  shareStatus: ShareStatus;

  @ApiProperty()
  isHidden: boolean;

  @ApiProperty({ required: false })
  lastSyncedAt?: Date;

  static fromEntity(account: BankAccount): AccountResponseDto {
    return {
      id: account.id,
      bankCode: account.bankCode,
      bankName: account.bankName,
      accountNumberMasked: account.accountNumberMasked,
      accountAlias: account.accountAlias,
      accountType: account.accountType,
      balance: Number(account.balance),
      shareStatus: account.shareStatus,
      isHidden: account.isHidden,
      lastSyncedAt: account.lastSyncedAt,
    };
  }
}

export class OpenBankingStatusDto {
  @ApiProperty()
  isConnected: boolean;

  @ApiProperty({ required: false })
  connectedAt?: Date;

  @ApiProperty({ required: false })
  expiresAt?: Date;
}
