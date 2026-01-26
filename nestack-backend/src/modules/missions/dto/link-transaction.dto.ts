import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ArrayNotEmpty } from 'class-validator';

export class LinkTransactionsDto {
  @ApiProperty({ description: 'Transaction IDs to link', type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  transactionIds: string[];
}
