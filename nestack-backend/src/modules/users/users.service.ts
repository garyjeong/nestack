import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, RefreshToken } from '../../database/entities';
import {
  UserNotFoundException,
  InvalidCredentialsException,
} from '../../common/exceptions/business.exception';
import { hashPassword, comparePassword } from '../../common/utils/crypto.util';
import { UpdateUserDto, ChangePasswordDto, UserResponseDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['familyGroup'],
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    return UserResponseDto.fromEntity(user);
  }

  async updateMe(userId: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    if (dto.name !== undefined) {
      user.name = dto.name;
    }

    if (dto.profileImageUrl !== undefined) {
      user.profileImageUrl = dto.profileImageUrl;
    }

    await this.userRepository.save(user);

    return UserResponseDto.fromEntity(user);
  }

  async deleteMe(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    // Delete all refresh tokens
    await this.refreshTokenRepository.delete({ userId });

    // Soft delete user
    await this.userRepository.softDelete({ id: userId });
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    if (!user.passwordHash) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await comparePassword(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    user.passwordHash = await hashPassword(dto.newPassword);
    await this.userRepository.save(user);

    // Delete all refresh tokens (logout from all devices)
    await this.refreshTokenRepository.delete({ userId });
  }
}
