import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import { TokensService } from '../tokens/tokens.service';
import { MailService } from '../mail/mail.service';
import {
  SignupDto,
  LoginDto,
  GoogleAuthDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import { BusinessException } from '../../common/exceptions/business.exception';
import { CryptoUtil } from '../../common/utils';
import { AuthProvider, UserStatus } from '../../common/enums';
import { JwtPayload, TokenPair } from '../../common/interfaces';
import { User } from '../users/entities/user.entity';

export interface AuthResponse {
  user: Partial<User>;
  tokens: TokenPair;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('google.clientId'),
    );
  }

  /**
   * Sign up with email and password
   */
  async signup(signupDto: SignupDto): Promise<{ user: Partial<User>; message: string }> {
    // Validate agreements
    if (!signupDto.termsAgreed || !signupDto.privacyAgreed) {
      throw new BusinessException('COMMON_001', {
        message: '이용약관 및 개인정보 처리방침에 동의해주세요.',
      });
    }

    // Create user
    const user = await this.usersService.create({
      email: signupDto.email,
      password: signupDto.password,
      name: signupDto.name,
      provider: AuthProvider.LOCAL,
    });

    // Create email verification token
    const verificationToken = await this.tokensService.createEmailVerificationToken(user.id);

    // Send verification email
    await this.mailService.sendVerificationEmail(user.email, user.name, verificationToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      message: '인증 메일이 발송되었습니다.',
    };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const userId = await this.tokensService.validateEmailVerificationToken(token);
    await this.usersService.verifyEmail(userId);

    // Get user and send welcome email
    const user = await this.usersService.findById(userId);
    if (user) {
      await this.mailService.sendWelcomeEmail(user.email, user.name);
    }

    return { message: '이메일 인증이 완료되었습니다.' };
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      // Don't reveal if email exists
      return { message: '인증 메일이 재발송되었습니다.' };
    }

    if (user.emailVerified) {
      throw new BusinessException('COMMON_001', {
        message: '이미 인증된 이메일입니다.',
      });
    }

    const verificationToken = await this.tokensService.createEmailVerificationToken(user.id);
    await this.mailService.sendVerificationEmail(user.email, user.name, verificationToken);

    return { message: '인증 메일이 재발송되었습니다.' };
  }

  /**
   * Login with email and password
   */
  async login(loginDto: LoginDto, deviceInfo?: string): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new BusinessException('AUTH_004');
    }

    // Check if user is local auth
    if (user.provider !== AuthProvider.LOCAL || !user.passwordHash) {
      throw new BusinessException('AUTH_004');
    }

    // Verify password
    const isPasswordValid = await CryptoUtil.verifyPassword(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BusinessException('AUTH_004');
    }

    // Check user status
    if (user.status === UserStatus.INACTIVE) {
      throw new BusinessException('AUTH_006');
    }

    if (user.status === UserStatus.WITHDRAWN) {
      throw new BusinessException('AUTH_007');
    }

    // Check email verification
    if (!user.emailVerified) {
      throw new BusinessException('AUTH_005');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user, deviceInfo, loginDto.rememberMe);

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    return {
      user: this.formatUserResponse(user),
      tokens,
    };
  }

  /**
   * Login with Google
   */
  async googleAuth(googleAuthDto: GoogleAuthDto, deviceInfo?: string): Promise<AuthResponse> {
    // Verify Google ID token
    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: googleAuthDto.idToken,
        audience: this.configService.get<string>('google.clientId'),
      });
      payload = ticket.getPayload();
    } catch {
      throw new BusinessException('AUTH_002', { message: 'Invalid Google token' });
    }

    if (!payload || !payload.email) {
      throw new BusinessException('AUTH_002', { message: 'Invalid Google token payload' });
    }

    // Find or create user
    let user = await this.usersService.findByProvider(AuthProvider.GOOGLE, payload.sub);

    if (!user) {
      // Check if email already exists with different provider
      const existingUser = await this.usersService.findByEmail(payload.email);
      if (existingUser) {
        throw new BusinessException('USER_001', {
          message: '이미 다른 방식으로 가입된 이메일입니다.',
        });
      }

      // Create new user
      user = await this.usersService.create({
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        provider: AuthProvider.GOOGLE,
        providerId: payload.sub,
        profileImageUrl: payload.picture,
      });

      // Send welcome email for new users
      await this.mailService.sendWelcomeEmail(user.email, user.name);
    }

    // Check user status
    if (user.status === UserStatus.INACTIVE) {
      throw new BusinessException('AUTH_006');
    }

    if (user.status === UserStatus.WITHDRAWN) {
      throw new BusinessException('AUTH_007');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user, deviceInfo);

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    return {
      user: this.formatUserResponse(user),
      tokens,
    };
  }

  /**
   * Refresh tokens
   */
  async refreshTokens(refreshToken: string, deviceInfo?: string): Promise<TokenPair> {
    const userId = await this.tokensService.validateRefreshToken(refreshToken);
    const user = await this.usersService.findByIdOrFail(userId);

    // Check user status
    if (user.status !== UserStatus.ACTIVE) {
      throw new BusinessException('AUTH_006');
    }

    // Rotate refresh token
    const newRefreshToken = await this.tokensService.rotateRefreshToken(
      refreshToken,
      deviceInfo,
    );

    // Generate new access token
    const accessToken = await this.generateAccessToken(user);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: this.getAccessTokenExpiration(),
    };
  }

  /**
   * Logout
   */
  async logout(userId: string, refreshToken?: string, allDevices: boolean = false): Promise<void> {
    if (allDevices) {
      await this.tokensService.deleteAllRefreshTokens(userId);
    } else if (refreshToken) {
      await this.tokensService.deleteRefreshToken(refreshToken);
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);

    // Always return success to prevent email enumeration
    const message = '비밀번호 재설정 메일이 발송되었습니다.';

    if (!user) {
      return { message };
    }

    // Only for local auth users
    if (user.provider !== AuthProvider.LOCAL) {
      return { message };
    }

    // Create password reset token
    const resetToken = await this.tokensService.createPasswordResetToken(user.id);

    // Send password reset email
    await this.mailService.sendPasswordResetEmail(user.email, user.name, resetToken);

    return { message };
  }

  /**
   * Reset password
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const userId = await this.tokensService.validatePasswordResetToken(resetPasswordDto.token);
    await this.usersService.resetPassword(userId, resetPasswordDto.newPassword);

    // Invalidate all refresh tokens for security
    await this.tokensService.deleteAllRefreshTokens(userId);

    return { message: '비밀번호가 재설정되었습니다.' };
  }

  // ==================== Private Helper Methods ====================

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(
    user: User,
    deviceInfo?: string,
    rememberMe: boolean = false,
  ): Promise<TokenPair> {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.tokensService.createRefreshToken(
      user.id,
      deviceInfo,
      rememberMe,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getAccessTokenExpiration(),
    };
  }

  /**
   * Generate access token
   */
  private async generateAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      type: 'access',
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.accessSecret') || 'fallback-secret',
      expiresIn: this.getAccessTokenExpiration(),
    });
  }

  /**
   * Get access token expiration in seconds
   */
  private getAccessTokenExpiration(): number {
    const expiration = this.configService.get<string>('jwt.accessExpiration') || '1h';
    const match = expiration.match(/^(\d+)([dhms])$/);
    if (!match) return 3600;

    const value = parseInt(match[1], 10);
    switch (match[2]) {
      case 'd': return value * 24 * 60 * 60;
      case 'h': return value * 60 * 60;
      case 'm': return value * 60;
      case 's': return value;
      default: return 3600;
    }
  }

  /**
   * Format user response (remove sensitive data)
   */
  private formatUserResponse(user: User): Partial<User> {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      profileImageUrl: user.profileImageUrl,
      provider: user.provider,
      emailVerified: user.emailVerified,
      familyGroupId: user.familyGroupId,
    };
  }
}
