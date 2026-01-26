import { ApiProperty } from '@nestjs/swagger';
import { FamilyGroup } from '../../../database/entities';

export class FamilyMemberDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  profileImageUrl?: string;

  @ApiProperty()
  isOwner: boolean;
}

export class FamilyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdBy: string;

  @ApiProperty({ type: [FamilyMemberDto] })
  members: FamilyMemberDto[];

  @ApiProperty()
  createdAt: Date;

  static fromEntity(familyGroup: FamilyGroup): FamilyResponseDto {
    return {
      id: familyGroup.id,
      createdBy: familyGroup.createdBy,
      members: familyGroup.members?.map((member) => ({
        id: member.id,
        name: member.name,
        profileImageUrl: member.profileImageUrl,
        isOwner: member.id === familyGroup.createdBy,
      })) || [],
      createdAt: familyGroup.createdAt,
    };
  }
}

export class InviteCodeResponseDto {
  @ApiProperty({ description: 'Invite code' })
  code: string;

  @ApiProperty({ description: 'Formatted invite code' })
  formattedCode: string;

  @ApiProperty({ description: 'Expiration date' })
  expiresAt: Date;
}
