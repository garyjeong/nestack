import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BankAccount } from './entities/bank-account.entity';
import { Transaction } from './entities/transaction.entity';
import { OpenBankingToken } from './entities/openbanking-token.entity';
import { UpdateAccountDto, TransactionQueryDto } from './dto';
import { BusinessException } from '../../common/exceptions/business.exception';
import { CryptoUtil } from '../../common/utils';
import { TransactionType } from '../../common/enums';

interface OpenBankingConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  apiBaseUrl: string;
  encryptionKey: string;
}

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);
  private readonly openBankingConfig: OpenBankingConfig;

  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(OpenBankingToken)
    private readonly tokenRepository: Repository<OpenBankingToken>,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.openBankingConfig = {
      clientId: this.configService.get<string>('openbanking.clientId') || '',
      clientSecret: this.configService.get<string>('openbanking.clientSecret') || '',
      redirectUri: this.configService.get<string>('openbanking.redirectUri') || '',
      apiBaseUrl: this.configService.get<string>('openbanking.apiBaseUrl') || 'https://testapi.openbanking.or.kr',
      encryptionKey: this.configService.get<string>('encryption.key') || '',
    };
  }

  /**
   * Generate OpenBanking authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.openBankingConfig.clientId,
      redirect_uri: this.openBankingConfig.redirectUri,
      scope: 'login inquiry transfer',
      state,
      auth_type: '0', // Simple auth
    });

    return `${this.openBankingConfig.apiBaseUrl}/oauth/2.0/authorize?${params.toString()}`;
  }

  /**
   * Handle OpenBanking OAuth callback
   */
  async handleCallback(userId: string, code: string): Promise<void> {
    try {
      // Exchange authorization code for tokens
      const tokenResponse = await this.exchangeCodeForTokens(code);

      // Encrypt tokens before storing
      const encryptedAccessToken = CryptoUtil.encrypt(tokenResponse.access_token, this.openBankingConfig.encryptionKey);
      const encryptedRefreshToken = CryptoUtil.encrypt(tokenResponse.refresh_token, this.openBankingConfig.encryptionKey);

      // Store or update tokens
      let existingToken = await this.tokenRepository.findOne({ where: { userId } });

      if (existingToken) {
        existingToken.accessToken = encryptedAccessToken;
        existingToken.refreshToken = encryptedRefreshToken;
        existingToken.tokenType = tokenResponse.token_type;
        existingToken.scope = tokenResponse.scope;
        existingToken.userSeqNo = tokenResponse.user_seq_no;
        existingToken.expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);
        await this.tokenRepository.save(existingToken);
      } else {
        const newToken = this.tokenRepository.create({
          userId,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          tokenType: tokenResponse.token_type,
          scope: tokenResponse.scope,
          userSeqNo: tokenResponse.user_seq_no,
          expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
        });
        await this.tokenRepository.save(newToken);
      }

      // Fetch and sync accounts
      await this.syncAccounts(userId);
    } catch (error) {
      this.logger.error('OpenBanking callback error', error);
      throw new BusinessException('FINANCE_001');
    }
  }

  /**
   * Exchange authorization code for tokens (simulated)
   */
  private async exchangeCodeForTokens(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
    user_seq_no: string;
  }> {
    // In production, make actual HTTP call to OpenBanking API
    // For development, return simulated response
    this.logger.log(`Exchanging code for tokens: ${code}`);

    // Simulated response
    return {
      access_token: `access_${Date.now()}`,
      refresh_token: `refresh_${Date.now()}`,
      token_type: 'Bearer',
      expires_in: 7776000, // 90 days
      scope: 'login inquiry transfer',
      user_seq_no: `U${Date.now()}`,
    };
  }

  /**
   * Sync accounts from OpenBanking
   */
  async syncAccounts(userId: string): Promise<BankAccount[]> {
    const token = await this.getValidToken(userId);
    if (!token) {
      throw new BusinessException('FINANCE_002');
    }

    try {
      // Fetch accounts from OpenBanking API (simulated)
      const accountsData = await this.fetchAccountsFromOpenBanking(token);

      // Sync accounts to database
      const accounts: BankAccount[] = [];

      for (const accountData of accountsData) {
        let account = await this.bankAccountRepository.findOne({
          where: { userId, fintechUseNum: accountData.fintech_use_num },
        });

        const encryptedAccountNumber = CryptoUtil.encrypt(accountData.account_num, this.openBankingConfig.encryptionKey);

        if (account) {
          account.balance = accountData.balance_amt;
          account.lastSyncedAt = new Date();
          await this.bankAccountRepository.save(account);
        } else {
          account = this.bankAccountRepository.create({
            userId,
            bankCode: accountData.bank_code_std,
            bankName: accountData.bank_name,
            accountNumber: encryptedAccountNumber,
            accountNumberMasked: accountData.account_num_masked,
            accountType: accountData.account_type,
            balance: accountData.balance_amt,
            fintechUseNum: accountData.fintech_use_num,
            lastSyncedAt: new Date(),
          });
          await this.bankAccountRepository.save(account);
        }

        accounts.push(account);
      }

      // Emit event
      this.eventEmitter.emit('accounts.synced', { userId, accounts });

      return accounts;
    } catch (error) {
      this.logger.error('Account sync error', error);
      throw new BusinessException('FINANCE_005');
    }
  }

  /**
   * Fetch accounts from OpenBanking API (simulated)
   */
  private async fetchAccountsFromOpenBanking(token: OpenBankingToken): Promise<Array<{
    fintech_use_num: string;
    account_num: string;
    account_num_masked: string;
    bank_code_std: string;
    bank_name: string;
    account_type: string;
    balance_amt: number;
  }>> {
    // Simulated response for development
    return [
      {
        fintech_use_num: `F${Date.now()}_1`,
        account_num: '1234567890123456',
        account_num_masked: '1234-****-****-3456',
        bank_code_std: '004',
        bank_name: 'KB국민은행',
        account_type: '입출금',
        balance_amt: 1500000,
      },
    ];
  }

  /**
   * Get user's bank accounts
   */
  async getAccounts(userId: string): Promise<BankAccount[]> {
    return this.bankAccountRepository.find({
      where: { userId, isHidden: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get account by ID
   */
  async getAccountById(userId: string, accountId: string): Promise<BankAccount> {
    const account = await this.bankAccountRepository.findOne({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new BusinessException('FINANCE_003');
    }

    return account;
  }

  /**
   * Update account settings
   */
  async updateAccount(userId: string, accountId: string, updateDto: UpdateAccountDto): Promise<BankAccount> {
    const account = await this.getAccountById(userId, accountId);

    if (updateDto.accountAlias !== undefined) account.accountAlias = updateDto.accountAlias;
    if (updateDto.shareStatus !== undefined) account.shareStatus = updateDto.shareStatus;
    if (updateDto.isHidden !== undefined) account.isHidden = updateDto.isHidden;

    await this.bankAccountRepository.save(account);
    return account;
  }

  /**
   * Sync single account transactions
   */
  async syncAccountTransactions(userId: string, accountId: string): Promise<Transaction[]> {
    const account = await this.getAccountById(userId, accountId);
    const token = await this.getValidToken(userId);

    if (!token) {
      throw new BusinessException('FINANCE_002');
    }

    try {
      // Fetch transactions from OpenBanking API (simulated)
      const transactionsData = await this.fetchTransactionsFromOpenBanking(token, account.fintechUseNum);

      const transactions: Transaction[] = [];

      for (const txData of transactionsData) {
        // Check if transaction already exists
        let tx = await this.transactionRepository.findOne({
          where: { bankAccountId: account.id, transactionId: txData.tran_num },
        });

        if (!tx) {
          tx = this.transactionRepository.create({
            bankAccountId: account.id,
            transactionId: txData.tran_num,
            type: txData.inout_type === 'I' ? TransactionType.DEPOSIT : TransactionType.WITHDRAWAL,
            amount: txData.tran_amt,
            balanceAfter: txData.after_balance_amt,
            description: txData.print_content,
            counterparty: txData.branch_name,
            transactionDate: new Date(txData.tran_date),
            transactionTime: txData.tran_time,
          });
          await this.transactionRepository.save(tx);
          transactions.push(tx);
        }
      }

      // Update account balance and sync time
      if (transactionsData.length > 0) {
        account.balance = transactionsData[0].after_balance_amt;
        account.lastSyncedAt = new Date();
        await this.bankAccountRepository.save(account);
      }

      // Emit event
      this.eventEmitter.emit('transactions.synced', { userId, accountId, transactions });

      return transactions;
    } catch (error) {
      this.logger.error('Transaction sync error', error);
      throw new BusinessException('FINANCE_005');
    }
  }

  /**
   * Fetch transactions from OpenBanking API (simulated)
   */
  private async fetchTransactionsFromOpenBanking(token: OpenBankingToken, fintechUseNum: string): Promise<Array<{
    tran_num: string;
    inout_type: 'I' | 'O';
    tran_amt: number;
    after_balance_amt: number;
    print_content: string;
    branch_name: string;
    tran_date: string;
    tran_time: string;
  }>> {
    // Simulated response for development
    return [
      {
        tran_num: `TX${Date.now()}`,
        inout_type: 'I',
        tran_amt: 100000,
        after_balance_amt: 1600000,
        print_content: '급여',
        branch_name: '회사',
        tran_date: new Date().toISOString().split('T')[0].replace(/-/g, ''),
        tran_time: '120000',
      },
    ];
  }

  /**
   * Get transactions for an account
   */
  async getTransactions(userId: string, accountId: string, query: TransactionQueryDto): Promise<Transaction[]> {
    const account = await this.getAccountById(userId, accountId);

    const where: any = { bankAccountId: account.id };

    if (query.startDate && query.endDate) {
      where.transactionDate = Between(new Date(query.startDate), new Date(query.endDate));
    } else if (query.startDate) {
      where.transactionDate = MoreThanOrEqual(new Date(query.startDate));
    } else if (query.endDate) {
      where.transactionDate = LessThanOrEqual(new Date(query.endDate));
    }

    if (query.type) {
      where.type = query.type;
    }

    return this.transactionRepository.find({
      where,
      order: { transactionDate: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Disconnect OpenBanking
   */
  async disconnect(userId: string): Promise<void> {
    // Delete token
    await this.tokenRepository.delete({ userId });

    // Delete all accounts and transactions (cascade)
    await this.bankAccountRepository.delete({ userId });
  }

  /**
   * Check if user has OpenBanking connected
   */
  async isConnected(userId: string): Promise<boolean> {
    const token = await this.tokenRepository.findOne({ where: { userId } });
    return !!token && token.expiresAt > new Date();
  }

  /**
   * Get valid token (refresh if needed)
   */
  private async getValidToken(userId: string): Promise<OpenBankingToken | null> {
    const token = await this.tokenRepository.findOne({ where: { userId } });

    if (!token) {
      return null;
    }

    // Check if token is expired
    if (token.expiresAt <= new Date()) {
      // Try to refresh token
      try {
        await this.refreshToken(token);
        return this.tokenRepository.findOne({ where: { userId } });
      } catch {
        return null;
      }
    }

    return token;
  }

  /**
   * Refresh OpenBanking token (simulated)
   */
  private async refreshToken(token: OpenBankingToken): Promise<void> {
    // In production, make actual HTTP call to OpenBanking API
    // For development, just extend the expiration
    token.expiresAt = new Date(Date.now() + 7776000 * 1000);
    await this.tokenRepository.save(token);
  }
}
