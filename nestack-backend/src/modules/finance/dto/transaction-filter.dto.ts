import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { TransactionType } from '../../../common/enums';
import { PaginationQueryDto } from '../../../common/dto/api-response.dto';

export class TransactionFilterDto extends PaginationQueryDto {
  @ApiProperty({ description: 'Bank account ID', required: false })
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ApiProperty({ description: 'Transaction type', required: false, enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Mission ID', required: false })
  @IsOptional()
  @IsUUID()
  missionId?: string;
}
