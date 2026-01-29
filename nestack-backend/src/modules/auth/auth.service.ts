import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuth2Client } from 'google-auth-library';
import { User, RefreshToken } from '../../database/entities';
import { AuthProvider, UserStatus } from '../../common/enums';
import {
  InvalidCredentialsException,
  InvalidTokenException,
  UserNotFoundException,
} from '../../common/exceptions/business.exception';
import { TokenResponseDto, AuthResponseDto, GoogleLoginDto } from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get('google.clientId'),
    );
  }

  async googleLogin(dto: GoogleLoginDto): Promise<AuthResponseDto> {
    try {
      // Verify Google ID token using google-auth-library
      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.idToken,
        audience: this.configService.get('google.clientId'),
      });

      const payload = ticket.getPayload();

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
        this.logger.log(`New user created via Google OAuth: ${user.email}`);
      } else if (user.provider !== AuthProvider.GOOGLE) {
        // Link Google account to existing user
        user.provider = AuthProvider.GOOGLE;
        user.providerId = payload.sub;
        if (!user.emailVerified) {
          user.emailVerified = true;
          user.emailVerifiedAt = new Date();
        }
        if (payload.picture && !user.profileImageUrl) {
          user.profileImageUrl = payload.picture;
        }
        await this.userRepository.save(user);
        this.logger.log(`Existing user linked to Google OAuth: ${user.email}`);
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
}
