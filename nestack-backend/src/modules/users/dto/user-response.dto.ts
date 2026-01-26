import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../database/entities';
import { AuthProvider, UserStatus } from '../../../common/enums';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  profileImageUrl?: string;

  @ApiProperty({ enum: AuthProvider })
  provider: AuthProvider;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty({ required: false })
  familyGroupId?: string;

  @ApiProperty()
  createdAt: Date;

  static fromEntity(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      profileImageUrl: user.profileImageUrl,
      provider: user.provider,
      emailVerified: user.emailVerified,
      status: user.status,
      familyGroupId: user.familyGroupId,
      createdAt: user.createdAt,
    };
  }
}
