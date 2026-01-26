import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsEnum, MaxLength } from 'class-validator';
import { ShareStatus } from '../../../common/enums';

export class UpdateAccountDto {
  @ApiProperty({ description: 'Account alias', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  accountAlias?: string;

  @ApiProperty({ description: 'Share status', enum: ShareStatus, required: false })
  @IsOptional()
  @IsEnum(ShareStatus)
  shareStatus?: ShareStatus;

  @ApiProperty({ description: 'Hide account', required: false })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;
}
