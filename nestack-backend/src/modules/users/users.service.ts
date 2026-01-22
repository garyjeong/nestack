import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateProfileDto, ChangePasswordDto } from './dto';
import { BusinessException } from '../../common/exceptions/business.exception';
import { CryptoUtil } from '../../common/utils';
import { AuthProvider, UserStatus } from '../../common/enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BusinessException('USER_001');
    }

    const user = this.userRepository.create({
      email: createUserDto.email,
      name: createUserDto.name,
      provider: createUserDto.provider || AuthProvider.LOCAL,
      providerId: createUserDto.providerId,
      profileImageUrl: createUserDto.profileImageUrl,
      emailVerified: createUserDto.provider !== AuthProvider.LOCAL, // Social login users are auto-verified
    });

    // Hash password for local users
    if (createUserDto.password) {
      user.passwordHash = await CryptoUtil.hashPassword(createUserDto.password);
    }

    return this.userRepository.save(user);
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['familyGroup'],
    });
  }

  /**
   * Find user by ID (throw if not found)
   */
  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new BusinessException('USER_003');
    }
    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['familyGroup'],
    });
  }

  /**
   * Find user by provider
   */
  async findByProvider(provider: AuthProvider, providerId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { provider, providerId },
      relations: ['familyGroup'],
    });
  }

  /**
   * Get user profile with family info
   */
  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['familyGroup', 'familyGroup.members'],
    });

    if (!user) {
      throw new BusinessException('USER_003');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.findByIdOrFail(userId);

    if (updateProfileDto.name !== undefined) {
      user.name = updateProfileDto.name;
    }

    if (updateProfileDto.profileImageUrl !== undefined) {
      user.profileImageUrl = updateProfileDto.profileImageUrl;
    }

    return this.userRepository.save(user);
  }

  /**
   * Change password
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.findByIdOrFail(userId);

    // Check if user has a password (local auth)
    if (!user.passwordHash) {
      throw new BusinessException('AUTH_004');
    }

    // Verify current password
    const isPasswordValid = await CryptoUtil.verifyPassword(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BusinessException('USER_004');
    }

    // Hash and save new password
    user.passwordHash = await CryptoUtil.hashPassword(changePasswordDto.newPassword);
    await this.userRepository.save(user);
  }

  /**
   * Update last login time
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }

  /**
   * Verify email
   */
  async verifyEmail(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });
  }

  /**
   * Reset password (used with password reset token)
   */
  async resetPassword(userId: string, newPassword: string): Promise<void> {
    const passwordHash = await CryptoUtil.hashPassword(newPassword);
    await this.userRepository.update(userId, { passwordHash });
  }

  /**
   * Update family group
   */
  async updateFamilyGroup(userId: string, familyGroupId: string | null): Promise<void> {
    await this.userRepository.update(userId, { familyGroupId });
  }

  /**
   * Withdraw (soft delete)
   */
  async withdraw(userId: string, password: string): Promise<void> {
    const user = await this.findByIdOrFail(userId);

    // Verify password for local users
    if (user.provider === AuthProvider.LOCAL && user.passwordHash) {
      const isPasswordValid = await CryptoUtil.verifyPassword(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new BusinessException('USER_004');
      }
    }

    // Update status and soft delete
    await this.userRepository.update(userId, {
      status: UserStatus.WITHDRAWN,
      familyGroupId: null,
    });
    await this.userRepository.softDelete(userId);
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { email } });
    return count > 0;
  }
}
