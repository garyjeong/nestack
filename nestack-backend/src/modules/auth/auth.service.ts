import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import {
  User,
  RefreshToken,
  EmailVerificationToken,
} from '../../database/entities';
import { AuthProvider, UserStatus, TokenType } from '../../common/enums';
import {
  hashPassword,
  comparePassword,
  generateRandomToken,
} from '../../common/utils/crypto.util';
import {
  UserAlreadyExistsException,
  InvalidCredentialsException,
  InvalidTokenException,
  UserNotFoundException,
  EmailNotVerifiedException,
} from '../../common/exceptions/business.exception';
import {
  SignupDto,
  LoginDto,
  TokenResponseDto,
  AuthResponseDto,
  GoogleLoginDto,
} from './dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(EmailVerificationToken)
    private emailTokenRepository: Repository<EmailVerificationToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthResponseDto> {
    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new UserAlreadyExistsException();
    }

    // Create user
    const passwordHash = await hashPassword(dto.password);
    const user = this.userRepository.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      provider: AuthProvider.LOCAL,
      status: UserStatus.ACTIVE,
    });

    await this.userRepository.save(user);

    // Create email verification token
    await this.createEmailVerificationToken(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      tokens,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await comparePassword(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      tokens,
    };
  }

  async googleLogin(dto: GoogleLoginDto): Promise<AuthResponseDto> {
    // Verify Google ID token (simplified - in production use Google API)
    // For now, we'll decode the token and extract user info
    try {
      const payload = this.jwtService.decode(dto.idToken) as any;

      if (!payload || !payload.email) {
        throw new InvalidCredentialsException();
      }

      let user = await this.userRepository.findOne({
        where: { email: payload.email },
      });

      if (!user) {
        // Create new user
        user = this.userRepository.create({
          email: payload.email,
          name: payload.name || payload.email.split('@')[0],
          profileImageUrl: payload.picture,
          provider: AuthProvider.GOOGLE,
          providerId: payload.sub,
          emailVerified: true,
          emailVerifiedAt: new Date(),
          status: UserStatus.ACTIVE,
        });
        await this.userRepository.save(user);
      } else if (user.provider !== AuthProvider.GOOGLE) {
        // Link Google account to existing user
        user.provider = AuthProvider.GOOGLE;
        user.providerId = payload.sub;
        if (!user.emailVerified) {
          user.emailVerified = true;
          user.emailVerifiedAt = new Date();
        }
        await this.userRepository.save(user);
      }

      // Update last login
      user.lastLoginAt = new Date();
      await this.userRepository.save(user);

      const tokens = await this.generateTokens(user);

      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        tokens,
      };
    } catch (error) {
      this.logger.error('Google login failed', error);
      throw new InvalidCredentialsException();
    }
  }

  async refresh(refreshToken: string): Promise<TokenResponseDto> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.secret'),
      });

      if (payload.type !== 'refresh') {
        throw new InvalidTokenException();
      }

      // Check if token exists in database
      const storedToken = await this.refreshTokenRepository.findOne({
        where: { token: refreshToken, userId: payload.sub },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new InvalidTokenException();
      }

      // Get user
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UserNotFoundException();
      }

      // Delete old refresh token
      await this.refreshTokenRepository.delete({ id: storedToken.id });

      // Generate new tokens
      return this.generateTokens(user);
    } catch (error) {
      throw new InvalidTokenException();
    }
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.refreshTokenRepository.delete({ userId, token: refreshToken });
    } else {
      // Delete all refresh tokens for user
      await this.refreshTokenRepository.delete({ userId });
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const emailToken = await this.emailTokenRepository.findOne({
      where: {
        token,
        type: TokenType.EMAIL_VERIFY,
        usedAt: null as any,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!emailToken) {
      throw new InvalidTokenException();
    }

    const user = await this.userRepository.findOne({
      where: { id: emailToken.userId },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    // Update user
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    await this.userRepository.save(user);

    // Mark token as used
    emailToken.usedAt = new Date();
    await this.emailTokenRepository.save(emailToken);
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    if (user.emailVerified) {
      return;
    }

    // Delete old tokens
    await this.emailTokenRepository.delete({
      userId: user.id,
      type: TokenType.EMAIL_VERIFY,
    });

    // Create new token and send email
    await this.createEmailVerificationToken(user.id);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // Delete old tokens
    await this.emailTokenRepository.delete({
      userId: user.id,
      type: TokenType.PASSWORD_RESET,
    });

    // Create password reset token
    const token = generateRandomToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    const resetToken = this.emailTokenRepository.create({
      userId: user.id,
      token,
      type: TokenType.PASSWORD_RESET,
      expiresAt,
    });

    await this.emailTokenRepository.save(resetToken);

    // Send password reset email
    await this.mailService.sendPasswordResetEmail(user.email, user.name, token);
    this.logger.log(`Password reset token created for user ${user.id}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetToken = await this.emailTokenRepository.findOne({
      where: {
        token,
        type: TokenType.PASSWORD_RESET,
        usedAt: null as any,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!resetToken) {
      throw new InvalidTokenException();
    }

    const user = await this.userRepository.findOne({
      where: { id: resetToken.userId },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    // Update password
    user.passwordHash = await hashPassword(newPassword);
    await this.userRepository.save(user);

    // Mark token as used
    resetToken.usedAt = new Date();
    await this.emailTokenRepository.save(resetToken);

    // Delete all refresh tokens (logout from all devices)
    await this.refreshTokenRepository.delete({ userId: user.id });
  }

  private async generateTokens(user: User): Promise<TokenResponseDto> {
    const accessTokenExpiry = this.configService.get('jwt.accessTokenExpiresIn');
    const refreshTokenExpiry = this.configService.get('jwt.refreshTokenExpiresIn');

    // Add jti (JWT ID) to ensure unique tokens even when generated at the same timestamp
    const jti = crypto.randomUUID();

    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'access', jti },
      { expiresIn: accessTokenExpiry },
    );

    const refreshToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'refresh', jti },
      { expiresIn: refreshTokenExpiry },
    );

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const refreshTokenEntity = this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  private async createEmailVerificationToken(userId: string): Promise<void> {
    const token = generateRandomToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

    const emailToken = this.emailTokenRepository.create({
      userId,
      token,
      type: TokenType.EMAIL_VERIFY,
      expiresAt,
    });

    await this.emailTokenRepository.save(emailToken);

    // Send verification email
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      await this.mailService.sendVerificationEmail(user.email, user.name, token);
    }
    this.logger.log(`Email verification token created for user ${userId}`);
  }
}
