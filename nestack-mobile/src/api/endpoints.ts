export const API_ENDPOINTS = {
  AUTH: {
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    GOOGLE: '/auth/google',
  },
  USERS: {
    ME: '/users/me',
  },
  FAMILY: {
    BASE: '/family',
    INVITE_CODE: '/family/invite-code',
    REGENERATE_CODE: '/family/invite-code/regenerate',
    JOIN: '/family/join',
    LEAVE: '/family/leave',
  },
  MISSIONS: {
    BASE: '/missions',
    TEMPLATES: '/missions/templates',
    CATEGORIES: '/missions/categories',
    DETAIL: (id: string) => `/missions/${id}`,
    STATUS: (id: string) => `/missions/${id}/status`,
    TRANSACTIONS: (id: string) => `/missions/${id}/transactions`,
  },
  FINANCE: {
    OPENBANKING: {
      AUTHORIZE: '/finance/openbanking/authorize',
      CALLBACK: '/finance/openbanking/callback',
      DISCONNECT: '/finance/openbanking',
    },
    ACCOUNTS: {
      BASE: '/finance/accounts',
      DETAIL: (id: string) => `/finance/accounts/${id}`,
      SYNC: (id: string) => `/finance/accounts/${id}/sync`,
      TRANSACTIONS: (id: string) => `/finance/accounts/${id}/transactions`,
    },
  },
  BADGES: {
    BASE: '/badges',
    ME: '/badges/me',
  },
  EVENTS: {
    SUBSCRIBE: '/events/subscribe',
  },
} as const
