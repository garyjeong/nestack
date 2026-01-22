export interface ShareSettingsResponse {
  accounts: {
    id: string;
    bankName: string;
    accountNumberMasked: string;
    balance: number;
    shareStatus: 'FULL' | 'BALANCE_ONLY' | 'PRIVATE';
    isHidden: boolean;
  }[];
}

export interface UpdateShareSettingsRequest {
  accounts: {
    accountId: string;
    shareStatus?: 'FULL' | 'BALANCE_ONLY' | 'PRIVATE';
  }[];
}
