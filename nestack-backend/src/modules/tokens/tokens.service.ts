import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RefreshToken } from './entities/refresh-token.entity';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { TokenType } from '../../common/enums';
import { CryptoUtil } from '../../common/utils';
import { BusinessException } from '../../common/exceptions/business.exception';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(EmailVerificationToken)
    private readonly emailTokenRepository: Repository<EmailVerificationToken>,
    private readonly configService: ConfigService,
  ) {}

  // ==================== Refresh Token ====================

  /**
   * Create and store a refresh token
   */
  async createRefreshToken(
    userId: string,
    deviceInfo?: string,
    rememberMe: boolean = false,
  ): Promise<string> {
    const token = CryptoUtil.generateRandomToken(32);

    // Parse expiration from config (e.g., "7d" or "30d")
    const expirationStr = rememberMe ? '30d' : this.configService.get<string>('jwt.refreshExpiration') || '7d';
    const expiresAt = this.parseExpiration(expirationStr);

    const refreshToken = this.refreshTokenRepository.create({
      userId,
      token,
      deviceInfo,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshToken);
    return token;
  }

  /**
   * Validate refresh token and return user ID
   */
  async validateRefreshToken(token: string): Promise<string> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
    });

    if (!refreshToken) {
      throw new BusinessException('AUTH_002');
    }

    if (refreshToken.expiresAt < new Date()) {
      await this.refreshTokenRepository.delete(refreshToken.id);
      throw new BusinessException('AUTH_001');
    }

    return refreshToken.userId;
  }

  /**
   * Rotate refresh token (delete old, create new)
   */
  async rotateRefreshToken(
    oldToken: string,
    deviceInfo?: string,
    rememberMe: boolean = false,
  ): Promise<string> {
    const userId = await this.validateRefreshToken(oldToken);
    await this.deleteRefreshToken(oldToken);
    return this.createRefreshToken(userId, deviceInfo, rememberMe);
  }

  /**
   * Delete a specific refresh token
   */
  async deleteRefreshToken(token: string): Promise<void> {
    await this.refreshTokenRepository.delete({ token });
  }

  /**
   * Delete all refresh tokens for a user
   */
  async deleteAllRefreshTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.delete({ userId });
  }

  /**
   * Delete expired refresh tokens (cleanup job)
   */
  async cleanupExpiredRefreshTokens(): Promise<number> {
    const result = await this.refreshTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
    return result.affected || 0;
  }

  // ==================== Email Verification Token ====================

  /**
   * Create email verification token
   */
  async createEmailVerificationToken(userId: string): Promise<string> {
    // Invalidate existing tokens
    await this.emailTokenRepository.update(
      { userId, type: TokenType.EMAIL_VERIFY, usedAt: undefined },
      { usedAt: new Date() },
    );

    const token = CryptoUtil.generateRandomToken(32);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const verificationToken = this.emailTokenRepository.create({
      userId,
      token,
      type: TokenType.EMAIL_VERIFY,
      expiresAt,
    });

    await this.emailTokenRepository.save(verificationToken);
    return token;
  }

  /**
   * Validate email verification token
   */
  async validateEmailVerificationToken(token: string): Promise<string> {
    const verificationToken = await this.emailTokenRepository.findOne({
      where: { token, type: TokenType.EMAIL_VERIFY },
    });

    if (!verificationToken) {
      throw new BusinessException('USER_005');
    }

    if (verificationToken.usedAt) {
      throw new BusinessException('USER_005');
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new BusinessException('USER_005');
    }

    // Mark as used
    await this.emailTokenRepository.update(verificationToken.id, {
      usedAt: new Date(),
    });

    return verificationToken.userId;
  }

  // ==================== Password Reset Token ====================

  /**
   * Create password reset token
   */
  async createPasswordResetToken(userId: string): Promise<string> {
    // Invalidate existing tokens
    await this.emailTokenRepository.update(
      { userId, type: TokenType.PASSWORD_RESET, usedAt: undefined },
      { usedAt: new Date() },
    );

    const token = CryptoUtil.generateRandomToken(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const resetToken = this.emailTokenRepository.create({
      userId,
      token,
      type: TokenType.PASSWORD_RESET,
      expiresAt,
    });

    await this.emailTokenRepository.save(resetToken);
    return token;
  }

  /**
   * Validate password reset token
   */
  async validatePasswordResetToken(token: string): Promise<string> {
    const resetToken = await this.emailTokenRepository.findOne({
      where: { token, type: TokenType.PASSWORD_RESET },
    });

    if (!resetToken) {
      throw new BusinessException('USER_005');
    }

    if (resetToken.usedAt) {
      throw new BusinessException('USER_005');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new BusinessException('USER_005');
    }

    // Mark as used
    await this.emailTokenRepository.update(resetToken.id, {
      usedAt: new Date(),
    });

    return resetToken.userId;
  }

  /**
   * Delete expired email tokens (cleanup job)
   */
  async cleanupExpiredEmailTokens(): Promise<number> {
    const result = await this.emailTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
    return result.affected || 0;
  }

  // ==================== Helper Methods ====================

  /**
   * Parse expiration string (e.g., "7d", "30d", "1h") to Date
   */
  private parseExpiration(expirationStr: string): Date {
    const match = expirationStr.match(/^(\d+)([dhms])$/);
    if (!match) {
      throw new Error(`Invalid expiration format: ${expirationStr}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const now = Date.now();
    switch (unit) {
      case 'd':
        return new Date(now + value * 24 * 60 * 60 * 1000);
      case 'h':
        return new Date(now + value * 60 * 60 * 1000);
      case 'm':
        return new Date(now + value * 60 * 1000);
      case 's':
        return new Date(now + value * 1000);
      default:
        throw new Error(`Unknown time unit: ${unit}`);
    }
  }
}
