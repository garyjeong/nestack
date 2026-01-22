import { apiClient } from '@/api/client'
import type {
  BankAccount,
  AccountsResponse,
  TransactionsResponse,
  TransactionFilters,
  FinanceSummary,
  OpenBankingAuthState,
  OpenBankingConnection,
  UpdateAccountRequest,
  LinkTransactionsRequest,
} from '../types'

const BASE_URL = '/finance'

export const financeApi = {
  // Open Banking
  getOpenBankingAuthUrl: async (): Promise<OpenBankingAuthState> => {
    const response = await apiClient.get(`${BASE_URL}/openbanking/authorize`)
    return response.data.data
  },

  handleOpenBankingCallback: async (code: string, state: string): Promise<OpenBankingConnection> => {
    const response = await apiClient.post(`${BASE_URL}/openbanking/callback`, { code, state })
    return response.data.data
  },

  getOpenBankingConnection: async (): Promise<OpenBankingConnection> => {
    const response = await apiClient.get(`${BASE_URL}/openbanking`)
    return response.data.data
  },

  disconnectOpenBanking: async (): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/openbanking`)
  },

  // Accounts
  getAccounts: async (): Promise<AccountsResponse> => {
    const response = await apiClient.get(`${BASE_URL}/accounts`)
    return response.data.data
  },

  getAccount: async (id: string): Promise<BankAccount> => {
    const response = await apiClient.get(`${BASE_URL}/accounts/${id}`)
    return response.data.data
  },

  updateAccount: async (id: string, data: UpdateAccountRequest): Promise<BankAccount> => {
    const response = await apiClient.patch(`${BASE_URL}/accounts/${id}`, data)
    return response.data.data
  },

  syncAccount: async (id: string): Promise<BankAccount> => {
    const response = await apiClient.post(`${BASE_URL}/accounts/${id}/sync`)
    return response.data.data
  },

  syncAllAccounts: async (): Promise<AccountsResponse> => {
    const response = await apiClient.post(`${BASE_URL}/accounts/sync`)
    return response.data.data
  },

  // Transactions
  getTransactions: async (filters?: TransactionFilters): Promise<TransactionsResponse> => {
    const params = new URLSearchParams()
    if (filters?.accountId) params.append('accountId', filters.accountId)
    if (filters?.type) params.append('type', filters.type)
    if (filters?.fromDate) params.append('fromDate', filters.fromDate)
    if (filters?.toDate) params.append('toDate', filters.toDate)
    if (filters?.missionId) params.append('missionId', filters.missionId)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const response = await apiClient.get(`${BASE_URL}/transactions?${params}`)
    return response.data.data
  },

  getAccountTransactions: async (accountId: string, filters?: TransactionFilters): Promise<TransactionsResponse> => {
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type)
    if (filters?.fromDate) params.append('fromDate', filters.fromDate)
    if (filters?.toDate) params.append('toDate', filters.toDate)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const response = await apiClient.get(`${BASE_URL}/accounts/${accountId}/transactions?${params}`)
    return response.data.data
  },

  linkTransactionsToMission: async (data: LinkTransactionsRequest): Promise<void> => {
    await apiClient.post(`${BASE_URL}/transactions/link`, data)
  },

  unlinkTransactionFromMission: async (transactionId: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/transactions/${transactionId}/link`)
  },

  // Summary
  getSummary: async (): Promise<FinanceSummary> => {
    const response = await apiClient.get(`${BASE_URL}/summary`)
    return response.data.data
  },
}
