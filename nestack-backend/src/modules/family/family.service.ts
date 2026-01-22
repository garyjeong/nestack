import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilyGroup } from './entities/family-group.entity';
import { InviteCode } from './entities/invite-code.entity';
import { User } from '../users/entities/user.entity';
import { JoinFamilyDto, UpdateShareSettingsDto } from './dto';
import { BusinessException } from '../../common/exceptions/business.exception';
import { InviteCodeUtil } from '../../common/utils';
import { FamilyGroupStatus, InviteCodeStatus } from '../../common/enums';

@Injectable()
export class FamilyService {
  private readonly logger = new Logger(FamilyService.name);

  constructor(
    @InjectRepository(FamilyGroup)
    private readonly familyGroupRepository: Repository<FamilyGroup>,
    @InjectRepository(InviteCode)
    private readonly inviteCodeRepository: Repository<InviteCode>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createFamilyGroup(userId: string): Promise<{ familyGroup: FamilyGroup; inviteCode: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BusinessException('USER_003');
    }

    if (user.familyGroupId) {
      throw new BusinessException('FAMILY_001', {
        message: '이미 가족 그룹에 속해 있습니다.',
      });
    }

    const familyGroup = this.familyGroupRepository.create({
      createdBy: userId,
      status: FamilyGroupStatus.ACTIVE,
    });
    await this.familyGroupRepository.save(familyGroup);

    await this.userRepository.update(userId, { familyGroupId: familyGroup.id });

    const inviteCode = await this.createInviteCode(userId, familyGroup.id);

    return { familyGroup, inviteCode: inviteCode.code };
  }

  async createInviteCode(userId: string, familyGroupId: string): Promise<InviteCode> {
    await this.inviteCodeRepository.update(
      { familyGroupId, status: InviteCodeStatus.PENDING },
      { status: InviteCodeStatus.EXPIRED },
    );

    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = InviteCodeUtil.generate();
      const existing = await this.inviteCodeRepository.findOne({ where: { code } });
      if (!existing) break;
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new BusinessException('FAMILY_002', {
        message: '초대 코드 생성에 실패했습니다. 다시 시도해주세요.',
      });
    }

    const inviteCode = this.inviteCodeRepository.create({
      code,
      familyGroupId,
      createdBy: userId,
      status: InviteCodeStatus.PENDING,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await this.inviteCodeRepository.save(inviteCode);
    return inviteCode;
  }

  async getActiveInviteCode(userId: string): Promise<InviteCode | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user?.familyGroupId) {
      return null;
    }

    const inviteCode = await this.inviteCodeRepository.findOne({
      where: {
        familyGroupId: user.familyGroupId,
        status: InviteCodeStatus.PENDING,
      },
      order: { createdAt: 'DESC' },
    });

    if (inviteCode && inviteCode.expiresAt < new Date()) {
      await this.inviteCodeRepository.update(inviteCode.id, {
        status: InviteCodeStatus.EXPIRED,
      });
      return null;
    }

    return inviteCode;
  }

  async regenerateInviteCode(userId: string): Promise<InviteCode> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user?.familyGroupId) {
      throw new BusinessException('FAMILY_003', {
        message: '가족 그룹에 속해 있지 않습니다.',
      });
    }

    return this.createInviteCode(userId, user.familyGroupId);
  }

  async joinFamily(userId: string, joinFamilyDto: JoinFamilyDto): Promise<FamilyGroup> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BusinessException('USER_003');
    }

    if (user.familyGroupId) {
      throw new BusinessException('FAMILY_001', {
        message: '이미 가족 그룹에 속해 있습니다.',
      });
    }

    const inviteCode = await this.inviteCodeRepository.findOne({
      where: { code: joinFamilyDto.inviteCode.toUpperCase() },
      relations: ['familyGroup'],
    });

    if (!inviteCode) {
      throw new BusinessException('FAMILY_004', {
        message: '유효하지 않은 초대 코드입니다.',
      });
    }

    if (inviteCode.status !== InviteCodeStatus.PENDING) {
      throw new BusinessException('FAMILY_004', {
        message: '이미 사용되었거나 만료된 초대 코드입니다.',
      });
    }

    if (inviteCode.expiresAt < new Date()) {
      await this.inviteCodeRepository.update(inviteCode.id, {
        status: InviteCodeStatus.EXPIRED,
      });
      throw new BusinessException('FAMILY_004', {
        message: '만료된 초대 코드입니다.',
      });
    }

    if (inviteCode.familyGroup.status !== FamilyGroupStatus.ACTIVE) {
      throw new BusinessException('FAMILY_005', {
        message: '비활성화된 가족 그룹입니다.',
      });
    }

    const memberCount = await this.userRepository.count({
      where: { familyGroupId: inviteCode.familyGroupId },
    });

    if (memberCount >= 2) {
      throw new BusinessException('FAMILY_006', {
        message: '가족 그룹이 이미 가득 찼습니다. (최대 2명)',
      });
    }

    await this.userRepository.update(userId, { familyGroupId: inviteCode.familyGroupId });

    await this.inviteCodeRepository.update(inviteCode.id, {
      status: InviteCodeStatus.USED,
      usedBy: userId,
      usedAt: new Date(),
    });

    return this.getFamilyGroup(inviteCode.familyGroupId);
  }

  async getFamilyGroup(familyGroupId: string): Promise<FamilyGroup> {
    const familyGroup = await this.familyGroupRepository.findOne({
      where: { id: familyGroupId },
      relations: ['members'],
    });

    if (!familyGroup) {
      throw new BusinessException('FAMILY_003', {
        message: '가족 그룹을 찾을 수 없습니다.',
      });
    }

    return familyGroup;
  }

  async getFamilyInfo(userId: string): Promise<{
    familyGroup: FamilyGroup | null;
    partner: Partial<User> | null;
    inviteCode: string | null;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user?.familyGroupId) {
      return { familyGroup: null, partner: null, inviteCode: null };
    }

    const familyGroup = await this.getFamilyGroup(user.familyGroupId);

    const partner = familyGroup.members.find((member) => member.id !== userId);
    const partnerInfo = partner
      ? {
          id: partner.id,
          name: partner.name,
          email: partner.email,
          profileImageUrl: partner.profileImageUrl,
        }
      : null;

    const inviteCode =
      familyGroup.members.length < 2 ? (await this.getActiveInviteCode(userId))?.code || null : null;

    const sanitizedMembers = familyGroup.members.map((m) => {
      const { passwordHash, ...rest } = m;
      return rest;
    });

    return {
      familyGroup: {
        ...familyGroup,
        members: sanitizedMembers as unknown as User[],
      },
      partner: partnerInfo,
      inviteCode,
    };
  }

  async leaveFamily(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user?.familyGroupId) {
      throw new BusinessException('FAMILY_003', {
        message: '가족 그룹에 속해 있지 않습니다.',
      });
    }

    const familyGroupId = user.familyGroupId;

    const memberCount = await this.userRepository.count({
      where: { familyGroupId },
    });

    await this.userRepository.update(userId, { familyGroupId: null });

    if (memberCount <= 1) {
      await this.familyGroupRepository.update(familyGroupId, {
        status: FamilyGroupStatus.DISSOLVED,
      });

      await this.inviteCodeRepository.update(
        { familyGroupId, status: InviteCodeStatus.PENDING },
        { status: InviteCodeStatus.EXPIRED },
      );
    }
  }

  async getShareSettings(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bankAccounts'],
    });

    if (!user?.familyGroupId) {
      return [];
    }

    if (!user?.bankAccounts) {
      return [];
    }

    const accounts = user.bankAccounts.map((account) => ({
      id: account.id,
      bankName: account.bankName,
      accountNumberMasked: account.accountNumberMasked,
      balance: account.balance,
      shareStatus: account.shareStatus,
      isHidden: account.isHidden,
    }));

    return accounts;
  }

  async updateShareSettings(
    userId: string,
    updateShareSettingsDto: UpdateShareSettingsDto,
  ): Promise<{ message: string; updatedAccounts: any[] }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bankAccounts'],
    });

    if (!user?.familyGroupId) {
      throw new BusinessException('FAMILY_003', {
        message: '가족 그룹에 속해 있지 않습니다.',
      });
    }

    const { accounts } = updateShareSettingsDto;

    const updatePromises = accounts.map((accountUpdate) =>
      this.userRepository.update(
        accountUpdate.accountId,
        { shareStatus: accountUpdate.shareStatus },
      ),
    );

    await Promise.all(updatePromises);

    const updatedAccounts = await this.getShareSettings(userId);

    return {
      message: '공유 설정이 변경되었습니다.',
      updatedAccounts,
    };
  }
}
