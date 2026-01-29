import { apiClient } from '../../../api/client'
import { API_ENDPOINTS } from '../../../api/endpoints'
import type {
  BankAccount,
  AccountsResponse,
  UpdateAccountRequest,
  SyncAccountRequest,
  Transaction,
  TransactionsResponse,
  TransactionFilters,
  FinanceSummary,
  OpenBankingAuthState,
  OpenBankingConnection,
  ConnectOpenBankingRequest,
  LinkTransactionsRequest,
} from '../types'

function buildParams(
  filters: object,
): Record<string, string | number | boolean | undefined> {
  const params: Record<string, string | number | boolean | undefined> = {}
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      params[key] = value as string | number | boolean
    }
  }
  return params
}

export const financeApi = {
  // --- Accounts ---
  getAccounts: () =>
    apiClient.get<AccountsResponse>(API_ENDPOINTS.FINANCE.ACCOUNTS.BASE),

  getAccount: (id: string) =>
    apiClient.get<BankAccount>(API_ENDPOINTS.FINANCE.ACCOUNTS.DETAIL(id)),

  updateAccount: (id: string, data: UpdateAccountRequest) =>
    apiClient.patch<BankAccount>(
      API_ENDPOINTS.FINANCE.ACCOUNTS.DETAIL(id),
      data,
    ),

  syncAccount: (id: string, data?: SyncAccountRequest) =>
    apiClient.post<BankAccount>(API_ENDPOINTS.FINANCE.ACCOUNTS.SYNC(id), data),

  syncAllAccounts: () =>
    apiClient.post<{ synced: number }>(
      `${API_ENDPOINTS.FINANCE.ACCOUNTS.BASE}/sync`,
    ),

  // --- Transactions ---
  getTransactions: (filters?: TransactionFilters) =>
    apiClient.get<TransactionsResponse>(
      `${API_ENDPOINTS.FINANCE.ACCOUNTS.BASE}/transactions`,
      { params: filters ? buildParams(filters) : undefined },
    ),

  getAccountTransactions: (accountId: string, filters?: TransactionFilters) =>
    apiClient.get<TransactionsResponse>(
      API_ENDPOINTS.FINANCE.ACCOUNTS.TRANSACTIONS(accountId),
      { params: filters ? buildParams(filters) : undefined },
    ),

  // --- Summary ---
  getFinanceSummary: () =>
    apiClient.get<FinanceSummary>(
      `${API_ENDPOINTS.FINANCE.ACCOUNTS.BASE}/summary`,
    ),

  // --- Open Banking ---
  getOpenBankingAuth: () =>
    apiClient.get<OpenBankingAuthState>(
      API_ENDPOINTS.FINANCE.OPENBANKING.AUTHORIZE,
    ),

  connectOpenBanking: (data: ConnectOpenBankingRequest) =>
    apiClient.post<OpenBankingConnection>(
      API_ENDPOINTS.FINANCE.OPENBANKING.CALLBACK,
      data,
    ),

  disconnectOpenBanking: () =>
    apiClient.delete(API_ENDPOINTS.FINANCE.OPENBANKING.DISCONNECT),

  // --- Transaction linking ---
  linkTransactions: (data: LinkTransactionsRequest) =>
    apiClient.post(
      `${API_ENDPOINTS.FINANCE.ACCOUNTS.BASE}/transactions/link`,
      data,
    ),

  unlinkTransaction: (transactionId: string) =>
    apiClient.delete(
      `${API_ENDPOINTS.FINANCE.ACCOUNTS.BASE}/transactions/${transactionId}/link`,
    ),
}
