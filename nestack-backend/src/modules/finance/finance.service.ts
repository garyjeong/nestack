import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  BankAccount,
  Transaction,
  OpenBankingToken,
  User,
} from '../../database/entities';
import { TransactionType, ShareStatus } from '../../common/enums';
import {
  BankAccountNotFoundException,
  OpenBankingTokenNotFoundException,
  UnauthorizedAccessException,
} from '../../common/exceptions/business.exception';
import {
  AccountResponseDto,
  UpdateAccountDto,
  TransactionResponseDto,
  TransactionFilterDto,
  OpenBankingStatusDto,
} from './dto';
import { PaginatedResponse, PaginationMeta } from '../../common/dto/api-response.dto';

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(
    @InjectRepository(BankAccount)
    private bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(OpenBankingToken)
    private openBankingTokenRepository: Repository<OpenBankingToken>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  // Open Banking
  getAuthorizeUrl(userId: string): string {
    const baseUrl = this.configService.get('openbanking.baseUrl');
    const clientId = this.configService.get('openbanking.clientId');
    const redirectUri = this.configService.get('openbanking.redirectUri');

    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');

    return `${baseUrl}/oauth/2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=login inquiry transfer&state=${state}&auth_type=0`;
  }

  async handleCallback(code: string, state: string): Promise<void> {
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString());

    const baseUrl = this.configService.get('openbanking.baseUrl');
    const clientId = this.configService.get('openbanking.clientId');
    const clientSecret = this.configService.get('openbanking.clientSecret');
    const redirectUri = this.configService.get('openbanking.redirectUri');

    try {
      // Exchange code for token
      const tokenResponse = await firstValueFrom(
        this.httpService.post(`${baseUrl}/oauth/2.0/token`, null, {
          params: {
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          },
        }),
      );

      const tokenData = tokenResponse.data;

      // Save or update token
      let token = await this.openBankingTokenRepository.findOne({
        where: { userId },
      });

      if (token) {
        token.accessToken = tokenData.access_token;
        token.refreshToken = tokenData.refresh_token;
        token.tokenType = tokenData.token_type;
        token.scope = tokenData.scope;
        token.userSeqNo = tokenData.user_seq_no;
        token.expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
      } else {
        token = this.openBankingTokenRepository.create({
          userId,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          tokenType: tokenData.token_type,
          scope: tokenData.scope,
          userSeqNo: tokenData.user_seq_no,
          expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        });
      }

      await this.openBankingTokenRepository.save(token);

      // Sync accounts
      await this.syncAccounts(userId);
    } catch (error) {
      this.logger.error('Open Banking callback failed', error);
      throw error;
    }
  }

  async getOpenBankingStatus(userId: string): Promise<OpenBankingStatusDto> {
    const token = await this.openBankingTokenRepository.findOne({
      where: { userId },
    });

    if (!token) {
      return { isConnected: false };
    }

    return {
      isConnected: true,
      connectedAt: token.createdAt,
      expiresAt: token.expiresAt,
    };
  }

  async disconnectOpenBanking(userId: string): Promise<void> {
    await this.openBankingTokenRepository.delete({ userId });
    // Optionally delete accounts and transactions
    // await this.bankAccountRepository.delete({ userId });
  }

  // Accounts
  async getAccounts(userId: string): Promise<AccountResponseDto[]> {
    const accounts = await this.bankAccountRepository.find({
      where: { userId, isHidden: false },
      order: { createdAt: 'DESC' },
    });

    return accounts.map((a) => AccountResponseDto.fromEntity(a));
  }

  async syncAccounts(userId: string): Promise<AccountResponseDto[]> {
    const token = await this.openBankingTokenRepository.findOne({
      where: { userId },
    });

    if (!token) {
      throw new OpenBankingTokenNotFoundException();
    }

    // In production, call Open Banking API to get accounts
    // For now, return existing accounts
    this.logger.log(`Syncing accounts for user ${userId}`);

    const accounts = await this.bankAccountRepository.find({
      where: { userId },
    });

    // Update last synced time
    await this.bankAccountRepository.update(
      { userId },
      { lastSyncedAt: new Date() },
    );

    return accounts.map((a) => AccountResponseDto.fromEntity(a));
  }

  async updateAccount(
    userId: string,
    accountId: string,
    dto: UpdateAccountDto,
  ): Promise<AccountResponseDto> {
    const account = await this.bankAccountRepository.findOne({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new BankAccountNotFoundException();
    }

    if (dto.accountAlias !== undefined) account.accountAlias = dto.accountAlias;
    if (dto.shareStatus !== undefined) account.shareStatus = dto.shareStatus;
    if (dto.isHidden !== undefined) account.isHidden = dto.isHidden;

    await this.bankAccountRepository.save(account);

    return AccountResponseDto.fromEntity(account);
  }

  // Transactions
  async getTransactions(
    userId: string,
    filters: TransactionFilterDto,
  ): Promise<PaginatedResponse<TransactionResponseDto>> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    // Get user's account IDs
    const accounts = await this.bankAccountRepository.find({
      where: { userId },
      select: ['id'],
    });

    const accountIds = accounts.map((a) => a.id);

    if (accountIds.length === 0) {
      return new PaginatedResponse([], new PaginationMeta(page, limit, 0));
    }

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.bank_account_id IN (:...accountIds)', { accountIds });

    if (filters.accountId) {
      queryBuilder.andWhere('transaction.bank_account_id = :accountId', {
        accountId: filters.accountId,
      });
    }

    if (filters.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: filters.type });
    }

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere(
        'transaction.transaction_date BETWEEN :startDate AND :endDate',
        { startDate: filters.startDate, endDate: filters.endDate },
      );
    } else if (filters.startDate) {
      queryBuilder.andWhere('transaction.transaction_date >= :startDate', {
        startDate: filters.startDate,
      });
    } else if (filters.endDate) {
      queryBuilder.andWhere('transaction.transaction_date <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters.missionId) {
      queryBuilder.andWhere('transaction.mission_id = :missionId', {
        missionId: filters.missionId,
      });
    }

    queryBuilder.orderBy('transaction.transaction_date', 'DESC');
    queryBuilder.addOrderBy('transaction.transaction_time', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [transactions, totalItems] = await queryBuilder.getManyAndCount();

    const data = transactions.map((t) => TransactionResponseDto.fromEntity(t));
    const meta = new PaginationMeta(page, limit, totalItems);

    return new PaginatedResponse(data, meta);
  }

  async syncTransactions(userId: string, accountId: string): Promise<void> {
    const account = await this.bankAccountRepository.findOne({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new BankAccountNotFoundException();
    }

    const token = await this.openBankingTokenRepository.findOne({
      where: { userId },
    });

    if (!token) {
      throw new OpenBankingTokenNotFoundException();
    }

    // In production, call Open Banking API to get transactions
    this.logger.log(`Syncing transactions for account ${accountId}`);

    // Update last synced time
    account.lastSyncedAt = new Date();
    await this.bankAccountRepository.save(account);
  }
}
