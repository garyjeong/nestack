import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { TokensService } from '../tokens/tokens.service';
import { MailService } from '../mail/mail.service';
import { EmailVerificationToken } from '../tokens/entities/email-verification-token.entity';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdOrFail: jest.fn(),
    updateLastLogin: jest.fn(),
  };

  const mockTokensService = {
    createRefreshToken: jest.fn(),
    createEmailVerificationToken: jest.fn(),
    validateRefreshToken: jest.fn(),
    rotateRefreshToken: jest.fn(),
    revokeRefreshToken: jest.fn(),
    revokeAllUserTokens: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, any> = {
        JWT_ACCESS_SECRET: 'test-access-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_ACCESS_EXPIRATION: '1h',
        JWT_REFRESH_EXPIRATION: '7d',
      };
      return config[key];
    }),
  };

  const mockMailService = {
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const mockEmailVerificationTokenRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: TokensService, useValue: mockTokensService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MailService, useValue: mockMailService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        {
          provide: getRepositoryToken(EmailVerificationToken),
          useValue: mockEmailVerificationTokenRepo,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    const signupDto = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
      termsAgreed: true,
      privacyAgreed: true,
    };

    it('should create a new user and send verification email', async () => {
      const createdUser = {
        id: 'user-uuid-1',
        ...signupDto,
        emailVerified: false,
      };
      mockUsersService.create.mockResolvedValue(createdUser);
      mockTokensService.createEmailVerificationToken.mockResolvedValue('verification-token');
      mockMailService.sendVerificationEmail.mockResolvedValue(undefined);

      const result = await service.signup(signupDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('message');
      expect(result.user.email).toBe(signupDto.email);
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalled();
    });
  });

  describe('refreshTokens', () => {
    it('should return new tokens with valid refresh token', async () => {
      const mockUser = {
        id: 'user-uuid-1',
        email: 'test@example.com',
        status: 'active',
      };
      mockTokensService.validateRefreshToken.mockResolvedValue('user-uuid-1');
      mockUsersService.findByIdOrFail.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('new-access-token');
      mockTokensService.rotateRefreshToken.mockResolvedValue('new-refresh-token');

      const result = await service.refreshTokens('valid-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });
});
