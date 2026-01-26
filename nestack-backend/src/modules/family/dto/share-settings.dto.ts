import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsArray, IsUUID } from 'class-validator';

export class UpdateShareSettingsDto {
  @ApiProperty({ description: 'Share all accounts', required: false })
  @IsOptional()
  @IsBoolean()
  shareAllAccounts?: boolean;

  @ApiProperty({ description: 'Specific account IDs to share', required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  sharedAccountIds?: string[];

  @ApiProperty({ description: 'Share all missions', required: false })
  @IsOptional()
  @IsBoolean()
  shareAllMissions?: boolean;

  @ApiProperty({ description: 'Specific mission IDs to share', required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  sharedMissionIds?: string[];
}

export class ShareSettingsResponseDto {
  @ApiProperty({ description: 'Shared account IDs' })
  sharedAccountIds: string[];

  @ApiProperty({ description: 'Shared mission IDs' })
  sharedMissionIds: string[];
}
