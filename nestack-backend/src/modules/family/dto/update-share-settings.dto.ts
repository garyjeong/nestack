import { IsArray, IsOptional } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { ShareStatus } from '../../../common/enums';

export class UpdateShareSettingsDto {
  @ApiPropertyOptional({
    description: '공유할 계좌 설정 목록',
  })
  @IsArray()
  @IsOptional()
  accounts: {
    accountId: string;
    @ApiProperty({ description: '계좌 ID' })
    @IsOptional()
    shareStatus?: ShareStatus;
  }[];
}
