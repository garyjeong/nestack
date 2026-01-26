import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  IOpenBankingService,
  OpenBankingAccountData,
  OpenBankingTransactionData,
} from './openbanking.interface';

@Injectable()
export class OpenBankingService implements IOpenBankingService {
  private readonly logger = new Logger(OpenBankingService.name);
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get('openbanking.baseUrl') || '';
    this.clientId = this.configService.get('openbanking.clientId') || '';
    this.clientSecret = this.configService.get('openbanking.clientSecret') || '';
  }

  async getAccounts(accessToken: string, userSeqNo: string): Promise<OpenBankingAccountData[]> {
    this.logger.log(`Getting accounts for userSeqNo: ${userSeqNo}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/v2.0/account/list`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            user_seq_no: userSeqNo,
            include_cancel_yn: 'N',
            sort_order: 'D',
          },
        }),
      );

      const data = response.data;

      if (data.rsp_code !== 'A0000') {
        this.logger.error(`Open Banking API error: ${data.rsp_message}`);
        return [];
      }

      return (data.res_list || []).map((account: any) => ({
        fintechUseNum: account.fintech_use_num,
        accountAlias: account.account_alias,
        bankCodeStd: account.bank_code_std,
        bankCodeSub: account.bank_code_sub,
        bankName: account.bank_name,
        accountNum: account.account_num,
        accountNumMasked: account.account_num_masked,
        accountType: account.account_type,
        accountHolder: account.account_holder_name,
        balanceAmt: 0, // Balance needs separate API call
      }));
    } catch (error) {
      this.logger.error('Failed to get accounts from Open Banking', error);
      throw error;
    }
  }

  async getTransactions(
    accessToken: string,
    fintechUseNum: string,
    fromDate: string,
    toDate: string,
  ): Promise<OpenBankingTransactionData[]> {
    this.logger.log(`Getting transactions for account: ${fintechUseNum}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/v2.0/account/transaction_list/fin_num`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            bank_tran_id: this.generateBankTranId(),
            fintech_use_num: fintechUseNum,
            inquiry_type: 'A',
            inquiry_base: 'D',
            from_date: fromDate.replace(/-/g, ''),
            to_date: toDate.replace(/-/g, ''),
            sort_order: 'D',
            tran_dtime: this.getCurrentDateTime(),
          },
        }),
      );

      const data = response.data;

      if (data.rsp_code !== 'A0000') {
        this.logger.error(`Open Banking API error: ${data.rsp_message}`);
        return [];
      }

      return (data.res_list || []).map((tran: any) => ({
        tranDate: tran.tran_date,
        tranTime: tran.tran_time,
        inoutType: tran.inout_type === '입금' ? 'IN' : 'OUT',
        tranType: tran.tran_type,
        printContent: tran.print_content,
        tranAmt: parseInt(tran.tran_amt),
        afterBalanceAmt: parseInt(tran.after_balance_amt),
        branchName: tran.branch_name,
      }));
    } catch (error) {
      this.logger.error('Failed to get transactions from Open Banking', error);
      throw error;
    }
  }

  async getBalance(accessToken: string, fintechUseNum: string): Promise<number> {
    this.logger.log(`Getting balance for account: ${fintechUseNum}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/v2.0/account/balance/fin_num`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            bank_tran_id: this.generateBankTranId(),
            fintech_use_num: fintechUseNum,
            tran_dtime: this.getCurrentDateTime(),
          },
        }),
      );

      const data = response.data;

      if (data.rsp_code !== 'A0000') {
        this.logger.error(`Open Banking API error: ${data.rsp_message}`);
        return 0;
      }

      return parseInt(data.balance_amt);
    } catch (error) {
      this.logger.error('Failed to get balance from Open Banking', error);
      throw error;
    }
  }

  private generateBankTranId(): string {
    // Format: 이용기관코드(10자리) + 'U' + 이용기관 부여번호(9자리)
    const orgCode = this.clientId.slice(0, 10);
    const seq = Date.now().toString().slice(-9);
    return `${orgCode}U${seq}`;
  }

  private getCurrentDateTime(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    const second = now.getSeconds().toString().padStart(2, '0');
    return `${year}${month}${day}${hour}${minute}${second}`;
  }
}
