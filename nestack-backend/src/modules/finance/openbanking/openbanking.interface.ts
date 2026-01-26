export interface OpenBankingAccountData {
  fintechUseNum: string;
  accountAlias: string;
  bankCodeStd: string;
  bankCodeSub: string;
  bankName: string;
  accountNum: string;
  accountNumMasked: string;
  accountType: string;
  accountHolder: string;
  balanceAmt: number;
}

export interface OpenBankingTransactionData {
  tranDate: string;
  tranTime: string;
  inoutType: 'IN' | 'OUT';
  tranType: string;
  printContent: string;
  tranAmt: number;
  afterBalanceAmt: number;
  branchName?: string;
}

export interface IOpenBankingService {
  getAccounts(accessToken: string, userSeqNo: string): Promise<OpenBankingAccountData[]>;
  getTransactions(
    accessToken: string,
    fintechUseNum: string,
    fromDate: string,
    toDate: string,
  ): Promise<OpenBankingTransactionData[]>;
  getBalance(accessToken: string, fintechUseNum: string): Promise<number>;
}

export const OPENBANKING_SERVICE = 'OPENBANKING_SERVICE';
