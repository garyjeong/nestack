// Share status for accounts
export type ShareStatus = 'full' | 'balance_only' | 'private'

// Bank account
export interface BankAccount {
  id: string
  userId: string
  familyGroupId?: string
  bankCode: string
  bankName: string
  accountNumber: string // Masked
  accountAlias?: string
  accountType: string
  balance: number
  shareStatus: ShareStatus
  isConnected: boolean
  lastSyncedAt?: string
  createdAt: string
  updatedAt: string
}

// Transaction
export interface Transaction {
  id: string
  bankAccountId: string
  missionId?: string
  transactionDate: string
  transactionType: 'deposit' | 'withdraw'
  amount: number
  balance: number
  description: string
  merchantName?: string
  category?: string
  createdAt: string
  // Relations
  bankAccount?: BankAccount
  mission?: {
    id: string
    name: string
  }
}

// Open Banking Token (for connection status display)
export interface OpenBankingConnection {
  isConnected: boolean
  connectedAt?: string
  expiresAt?: string
  bankAccounts: number
}

// API Request types
export interface ConnectOpenBankingRequest {
  authorizationCode: string
  state: string
}

export interface UpdateAccountRequest {
  accountAlias?: string
  shareStatus?: ShareStatus
}

export interface SyncAccountRequest {
  fromDate?: string
  toDate?: string
}

export interface LinkTransactionsRequest {
  transactionIds: string[]
  missionId: string
}

// API Response types
export interface AccountsResponse {
  accounts: BankAccount[]
  total: number
}

export interface TransactionsResponse {
  transactions: Transaction[]
  total: number
  page: number
  limit: number
}

export interface TransactionFilters {
  accountId?: string
  type?: 'deposit' | 'withdraw'
  fromDate?: string
  toDate?: string
  missionId?: string
  page?: number
  limit?: number
}

// Dashboard summary
export interface FinanceSummary {
  totalBalance: number
  connectedAccounts: number
  monthlyIncome: number
  monthlyExpense: number
  savingsRate: number
}

// Open Banking OAuth state
export interface OpenBankingAuthState {
  url: string
  state: string
}
