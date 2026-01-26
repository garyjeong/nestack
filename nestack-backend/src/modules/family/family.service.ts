import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import {
  User,
  FamilyGroup,
  InviteCode,
  BankAccount,
  Mission,
} from '../../database/entities';
import {
  FamilyStatus,
  InviteCodeStatus,
  ShareStatus,
} from '../../common/enums';
import {
  FamilyGroupNotFoundException,
  AlreadyInFamilyGroupException,
  InvalidInviteCodeException,
  UnauthorizedAccessException,
} from '../../common/exceptions/business.exception';
import {
  generateInviteCode,
  formatInviteCode,
  normalizeInviteCode,
} from '../../common/utils/invite-code.util';
import {
  JoinFamilyDto,
  UpdateShareSettingsDto,
  FamilyResponseDto,
  InviteCodeResponseDto,
  ShareSettingsResponseDto,
} from './dto';

@Injectable()
export class FamilyService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(FamilyGroup)
    private familyGroupRepository: Repository<FamilyGroup>,
    @InjectRepository(InviteCode)
    private inviteCodeRepository: Repository<InviteCode>,
    @InjectRepository(BankAccount)
    private bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(Mission)
    private missionRepository: Repository<Mission>,
  ) {}

  async createFamily(userId: string): Promise<FamilyResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new FamilyGroupNotFoundException();
    }

    if (user.familyGroupId) {
      throw new AlreadyInFamilyGroupException();
    }

    // Create family group
    const familyGroup = this.familyGroupRepository.create({
      createdBy: userId,
      status: FamilyStatus.ACTIVE,
    });

    await this.familyGroupRepository.save(familyGroup);

    // Update user
    user.familyGroupId = familyGroup.id;
    await this.userRepository.save(user);

    // Create initial invite code
    await this.createInviteCode(familyGroup.id, userId);

    // Load with members
    const savedGroup = await this.familyGroupRepository.findOne({
      where: { id: familyGroup.id },
      relations: ['members'],
    });

    return FamilyResponseDto.fromEntity(savedGroup!);
  }

  async getFamily(userId: string): Promise<FamilyResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.familyGroupId) {
      throw new FamilyGroupNotFoundException();
    }

    const familyGroup = await this.familyGroupRepository.findOne({
      where: { id: user.familyGroupId },
      relations: ['members'],
    });

    if (!familyGroup) {
      throw new FamilyGroupNotFoundException();
    }

    return FamilyResponseDto.fromEntity(familyGroup);
  }

  async leaveFamily(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.familyGroupId) {
      throw new FamilyGroupNotFoundException();
    }

    const familyGroup = await this.familyGroupRepository.findOne({
      where: { id: user.familyGroupId },
      relations: ['members'],
    });

    if (!familyGroup) {
      throw new FamilyGroupNotFoundException();
    }

    // Remove user from family
    user.familyGroupId = null as any;
    await this.userRepository.save(user);

    // If user was the owner and there are other members, transfer ownership
    if (familyGroup.createdBy === userId && familyGroup.members.length > 1) {
      const newOwner = familyGroup.members.find((m) => m.id !== userId);
      if (newOwner) {
        familyGroup.createdBy = newOwner.id;
        await this.familyGroupRepository.save(familyGroup);
      }
    }

    // If no members left, mark family as inactive
    const remainingMembers = await this.userRepository.count({
      where: { familyGroupId: familyGroup.id },
    });

    if (remainingMembers === 0) {
      familyGroup.status = FamilyStatus.INACTIVE;
      await this.familyGroupRepository.save(familyGroup);
    }
  }

  async joinFamily(userId: string, dto: JoinFamilyDto): Promise<FamilyResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new FamilyGroupNotFoundException();
    }

    if (user.familyGroupId) {
      throw new AlreadyInFamilyGroupException();
    }

    const normalizedCode = normalizeInviteCode(dto.code);

    const inviteCode = await this.inviteCodeRepository.findOne({
      where: {
        code: normalizedCode,
        status: InviteCodeStatus.PENDING,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!inviteCode) {
      throw new InvalidInviteCodeException();
    }

    // Join family
    user.familyGroupId = inviteCode.familyGroupId;
    await this.userRepository.save(user);

    // Mark invite code as used
    inviteCode.status = InviteCodeStatus.USED;
    inviteCode.usedBy = userId;
    inviteCode.usedAt = new Date();
    await this.inviteCodeRepository.save(inviteCode);

    // Load family with members
    const familyGroup = await this.familyGroupRepository.findOne({
      where: { id: inviteCode.familyGroupId },
      relations: ['members'],
    });

    return FamilyResponseDto.fromEntity(familyGroup!);
  }

  async getInviteCode(userId: string): Promise<InviteCodeResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.familyGroupId) {
      throw new FamilyGroupNotFoundException();
    }

    // Find active invite code
    let inviteCode = await this.inviteCodeRepository.findOne({
      where: {
        familyGroupId: user.familyGroupId,
        status: InviteCodeStatus.PENDING,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });

    // Create new if not found
    if (!inviteCode) {
      inviteCode = await this.createInviteCode(user.familyGroupId, userId);
    }

    return {
      code: inviteCode.code,
      formattedCode: formatInviteCode(inviteCode.code),
      expiresAt: inviteCode.expiresAt,
    };
  }

  async regenerateInviteCode(userId: string): Promise<InviteCodeResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.familyGroupId) {
      throw new FamilyGroupNotFoundException();
    }

    // Expire old codes
    await this.inviteCodeRepository.update(
      {
        familyGroupId: user.familyGroupId,
        status: InviteCodeStatus.PENDING,
      },
      { status: InviteCodeStatus.EXPIRED },
    );

    // Create new code
    const inviteCode = await this.createInviteCode(user.familyGroupId, userId);

    return {
      code: inviteCode.code,
      formattedCode: formatInviteCode(inviteCode.code),
      expiresAt: inviteCode.expiresAt,
    };
  }

  async getShareSettings(userId: string): Promise<ShareSettingsResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.familyGroupId) {
      throw new FamilyGroupNotFoundException();
    }

    // Get shared accounts
    const sharedAccounts = await this.bankAccountRepository.find({
      where: {
        userId,
        shareStatus: ShareStatus.SHARED,
      },
      select: ['id'],
    });

    // Get shared missions
    const sharedMissions = await this.missionRepository.find({
      where: {
        userId,
        familyGroupId: user.familyGroupId,
      },
      select: ['id'],
    });

    return {
      sharedAccountIds: sharedAccounts.map((a) => a.id),
      sharedMissionIds: sharedMissions.map((m) => m.id),
    };
  }

  async updateShareSettings(
    userId: string,
    dto: UpdateShareSettingsDto,
  ): Promise<ShareSettingsResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.familyGroupId) {
      throw new FamilyGroupNotFoundException();
    }

    // Update account sharing
    if (dto.shareAllAccounts !== undefined) {
      await this.bankAccountRepository.update(
        { userId },
        { shareStatus: dto.shareAllAccounts ? ShareStatus.SHARED : ShareStatus.PRIVATE },
      );
    } else if (dto.sharedAccountIds) {
      // Reset all to private first
      await this.bankAccountRepository.update(
        { userId },
        { shareStatus: ShareStatus.PRIVATE },
      );

      // Set specific accounts to shared
      if (dto.sharedAccountIds.length > 0) {
        await this.bankAccountRepository
          .createQueryBuilder()
          .update()
          .set({ shareStatus: ShareStatus.SHARED })
          .where('id IN (:...ids) AND user_id = :userId', {
            ids: dto.sharedAccountIds,
            userId,
          })
          .execute();
      }
    }

    // Update mission sharing
    if (dto.shareAllMissions !== undefined) {
      const updateData = dto.shareAllMissions
        ? { familyGroupId: user.familyGroupId }
        : { familyGroupId: null as any };

      await this.missionRepository.update({ userId }, updateData);
    } else if (dto.sharedMissionIds) {
      // Reset all missions' family group
      await this.missionRepository.update({ userId }, { familyGroupId: null as any });

      // Set specific missions to shared
      if (dto.sharedMissionIds.length > 0) {
        await this.missionRepository
          .createQueryBuilder()
          .update()
          .set({ familyGroupId: user.familyGroupId })
          .where('id IN (:...ids) AND user_id = :userId', {
            ids: dto.sharedMissionIds,
            userId,
          })
          .execute();
      }
    }

    return this.getShareSettings(userId);
  }

  private async createInviteCode(
    familyGroupId: string,
    createdBy: string,
  ): Promise<InviteCode> {
    const code = generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const inviteCode = this.inviteCodeRepository.create({
      code,
      familyGroupId,
      createdBy,
      status: InviteCodeStatus.PENDING,
      expiresAt,
    });

    return this.inviteCodeRepository.save(inviteCode);
  }
}
