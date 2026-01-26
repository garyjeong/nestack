import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import {
  AnnouncementDisplayType,
  AnnouncementStatus,
} from '../../../common/enums';

export class CreateAnnouncementDto {
  @ApiProperty({ description: 'Announcement title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Announcement content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'Display type', enum: AnnouncementDisplayType })
  @IsEnum(AnnouncementDisplayType)
  @IsNotEmpty()
  displayType: AnnouncementDisplayType;

  @ApiProperty({ description: 'Start date' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: 'End date' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}

export class UpdateAnnouncementDto {
  @ApiProperty({ description: 'Announcement title', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiProperty({ description: 'Announcement content', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: 'Display type',
    enum: AnnouncementDisplayType,
    required: false,
  })
  @IsOptional()
  @IsEnum(AnnouncementDisplayType)
  displayType?: AnnouncementDisplayType;

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Status', enum: AnnouncementStatus, required: false })
  @IsOptional()
  @IsEnum(AnnouncementStatus)
  status?: AnnouncementStatus;
}
