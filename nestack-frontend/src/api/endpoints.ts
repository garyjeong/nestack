// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    GOOGLE: '/auth/google',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Users
  USERS: {
    ME: '/users/me',
    PASSWORD: '/users/me/password',
  },

  // Family
  FAMILY: {
    BASE: '/family',
    INVITE_CODE: '/family/invite-code',
    REGENERATE_CODE: '/family/invite-code/regenerate',
    JOIN: '/family/join',
    LEAVE: '/family/leave',
  },

  // Missions
  MISSIONS: {
    BASE: '/missions',
    TEMPLATES: '/missions/templates',
    CATEGORIES: '/missions/categories',
    DETAIL: (id: string) => `/missions/${id}`,
    STATUS: (id: string) => `/missions/${id}/status`,
    TRANSACTIONS: (id: string) => `/missions/${id}/transactions`,
  },

  // Finance
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

  // Badges
  BADGES: {
    BASE: '/badges',
    ME: '/badges/me',
  },

  // Events (SSE)
  EVENTS: {
    SUBSCRIBE: '/events/subscribe',
  },
} as const
