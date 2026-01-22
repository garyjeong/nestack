import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FamilyService } from './family.service';
import { FamilyGroup } from './entities/family-group.entity';
import { InviteCode } from './entities/invite-code.entity';
import { User } from '../users/entities/user.entity';

describe('FamilyService', () => {
  let service: FamilyService;

  const mockFamilyGroupRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockInviteCodeRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    find: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FamilyService,
        {
          provide: getRepositoryToken(FamilyGroup),
          useValue: mockFamilyGroupRepository,
        },
        {
          provide: getRepositoryToken(InviteCode),
          useValue: mockInviteCodeRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<FamilyService>(FamilyService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getActiveInviteCode', () => {
    it('should return active invite code when exists', async () => {
      const mockUser = {
        id: 'user-uuid-1',
        familyGroupId: 'family-uuid-1',
      };
      const mockInviteCode = {
        id: 'invite-uuid-1',
        code: 'ABCD1234EFGH',
        status: 'active',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockInviteCodeRepository.findOne.mockResolvedValue(mockInviteCode);

      const result = await service.getActiveInviteCode('user-uuid-1');

      expect(result).toEqual(mockInviteCode);
    });

    it('should return null when no active invite code', async () => {
      const mockUser = {
        id: 'user-uuid-1',
        familyGroupId: 'family-uuid-1',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockInviteCodeRepository.findOne.mockResolvedValue(null);

      const result = await service.getActiveInviteCode('user-uuid-1');

      expect(result).toBeNull();
    });
  });
});
