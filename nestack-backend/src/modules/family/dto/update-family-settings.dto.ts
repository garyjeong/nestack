import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFamilySettingsDto {
  @ApiPropertyOptional({
    description: '가족 그룹 별명',
    example: '우리 가족',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;
}
