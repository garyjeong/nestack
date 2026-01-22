import { IsOptional, IsString, IsEnum, IsBoolean, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ShareStatus } from '../../../common/enums';

export class UpdateAccountDto {
  @ApiPropertyOptional({
    description: '계좌 별명',
    example: '결혼자금 계좌',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  accountAlias?: string;

  @ApiPropertyOptional({
    description: '공유 상태',
    enum: ShareStatus,
  })
  @IsOptional()
  @IsEnum(ShareStatus)
  shareStatus?: ShareStatus;

  @ApiPropertyOptional({
    description: '숨김 여부',
  })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;
}
