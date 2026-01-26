import { Injectable, Logger } from '@nestjs/common';
import {
  IOpenBankingService,
  OpenBankingAccountData,
  OpenBankingTransactionData,
} from './openbanking.interface';

@Injectable()
export class OpenBankingMockService implements IOpenBankingService {
  private readonly logger = new Logger(OpenBankingMockService.name);

  // Mock bank data
  private readonly banks = [
    { code: '004', name: 'KB국민은행' },
    { code: '088', name: '신한은행' },
    { code: '020', name: '우리은행' },
    { code: '081', name: '하나은행' },
    { code: '011', name: 'NH농협은행' },
    { code: '003', name: 'IBK기업은행' },
    { code: '023', name: 'SC제일은행' },
    { code: '027', name: '한국씨티은행' },
    { code: '071', name: '우체국' },
    { code: '090', name: '카카오뱅크' },
    { code: '092', name: '토스뱅크' },
  ];

  // Mock transaction descriptions
  private readonly incomeDescriptions = [
    '급여', '상여금', '이자입금', '환급금', '용돈',
    '부모님용돈', '배당금', '적금해지', '보험금',
  ];

  private readonly expenseDescriptions = [
    '카드결제', '공과금', '통신비', '관리비', '보험료',
    '식비', '교통비', '쇼핑', '병원비', '약국',
    '마트', '편의점', '카페', '음식점', '주유소',
    '온라인쇼핑', '구독료', '학원비', '헬스장',
  ];

  async getAccounts(accessToken: string, userSeqNo: string): Promise<OpenBankingAccountData[]> {
    this.logger.log(`[Mock] Getting accounts for userSeqNo: ${userSeqNo}`);

    // Simulate API delay
    await this.delay(500);

    // Generate 2-4 mock accounts
    const numAccounts = this.randomInt(2, 4);
    const accounts: OpenBankingAccountData[] = [];

    for (let i = 0; i < numAccounts; i++) {
      const bank = this.banks[this.randomInt(0, this.banks.length - 1)];
      const accountNum = this.generateAccountNumber();
      const balance = this.randomInt(100000, 50000000);

      accounts.push({
        fintechUseNum: this.generateFintechUseNum(userSeqNo, i),
        accountAlias: `${bank.name} 입출금`,
        bankCodeStd: bank.code,
        bankCodeSub: bank.code,
        bankName: bank.name,
        accountNum,
        accountNumMasked: this.maskAccountNumber(accountNum),
        accountType: 'D',
        accountHolder: '홍길동',
        balanceAmt: balance,
      });
    }

    this.logger.log(`[Mock] Returning ${accounts.length} accounts`);
    return accounts;
  }

  async getTransactions(
    accessToken: string,
    fintechUseNum: string,
    fromDate: string,
    toDate: string,
  ): Promise<OpenBankingTransactionData[]> {
    this.logger.log(`[Mock] Getting transactions for account: ${fintechUseNum}`);
    this.logger.log(`[Mock] Period: ${fromDate} ~ ${toDate}`);

    // Simulate API delay
    await this.delay(300);

    // Generate mock transactions
    const transactions: OpenBankingTransactionData[] = [];
    const startDate = this.parseDate(fromDate);
    const endDate = this.parseDate(toDate);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Generate 2-5 transactions per day
    let runningBalance = this.randomInt(1000000, 10000000);

    for (let d = 0; d <= Math.min(daysDiff, 30); d++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + d);
      const dateStr = this.formatDate(date);

      const numTransactions = this.randomInt(0, 5);

      for (let t = 0; t < numTransactions; t++) {
        const isIncome = Math.random() < 0.3; // 30% income
        const amount = isIncome
          ? this.randomInt(10000, 5000000)
          : this.randomInt(1000, 500000);

        if (isIncome) {
          runningBalance += amount;
        } else {
          runningBalance = Math.max(0, runningBalance - amount);
        }

        transactions.push({
          tranDate: dateStr,
          tranTime: this.generateTime(),
          inoutType: isIncome ? 'IN' : 'OUT',
          tranType: isIncome ? '입금' : '출금',
          printContent: isIncome
            ? this.incomeDescriptions[this.randomInt(0, this.incomeDescriptions.length - 1)]
            : this.expenseDescriptions[this.randomInt(0, this.expenseDescriptions.length - 1)],
          tranAmt: amount,
          afterBalanceAmt: runningBalance,
        });
      }
    }

    // Sort by date and time descending
    transactions.sort((a, b) => {
      const dateCompare = b.tranDate.localeCompare(a.tranDate);
      if (dateCompare !== 0) return dateCompare;
      return b.tranTime.localeCompare(a.tranTime);
    });

    this.logger.log(`[Mock] Returning ${transactions.length} transactions`);
    return transactions;
  }

  async getBalance(accessToken: string, fintechUseNum: string): Promise<number> {
    this.logger.log(`[Mock] Getting balance for account: ${fintechUseNum}`);

    await this.delay(200);

    return this.randomInt(100000, 50000000);
  }

  // Helper methods
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateAccountNumber(): string {
    const parts = [
      this.randomInt(100, 999).toString(),
      this.randomInt(100000, 999999).toString(),
      this.randomInt(10, 99).toString(),
      this.randomInt(100, 999).toString(),
    ];
    return parts.join('-');
  }

  private maskAccountNumber(accountNum: string): string {
    const parts = accountNum.split('-');
    if (parts.length >= 2) {
      parts[1] = '******';
    }
    return parts.join('-');
  }

  private generateFintechUseNum(userSeqNo: string, index: number): string {
    return `${userSeqNo}${Date.now()}${index}`.slice(0, 24);
  }

  private generateTime(): string {
    const hour = this.randomInt(0, 23).toString().padStart(2, '0');
    const minute = this.randomInt(0, 59).toString().padStart(2, '0');
    const second = this.randomInt(0, 59).toString().padStart(2, '0');
    return `${hour}${minute}${second}`;
  }

  private parseDate(dateStr: string): Date {
    // Format: YYYYMMDD or YYYY-MM-DD
    const cleaned = dateStr.replace(/-/g, '');
    const year = parseInt(cleaned.substring(0, 4));
    const month = parseInt(cleaned.substring(4, 6)) - 1;
    const day = parseInt(cleaned.substring(6, 8));
    return new Date(year, month, day);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }
}
