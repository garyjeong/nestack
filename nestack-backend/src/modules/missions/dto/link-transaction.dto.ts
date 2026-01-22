import { IsNotEmpty, IsUUID, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkTransactionDto {
  @ApiProperty({
    description: '연결할 거래 ID 목록',
    example: ['uuid-transaction-1', 'uuid-transaction-2'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  transactionIds: string[];
}
