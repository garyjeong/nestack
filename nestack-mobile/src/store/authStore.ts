import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createMMKV } from 'react-native-mmkv'

// --- MMKV Storage Adapter ---

const storage = createMMKV()

const mmkvStorage = {
  getItem: (name: string): string | null => {
    return storage.getString(name) ?? null
  },
  setItem: (name: string, value: string): void => {
    storage.set(name, value)
  },
  removeItem: (name: string): void => {
    storage.remove(name)
  },
}

// --- Types ---

interface User {
  id: string
  email: string
  name: string
  profileImage?: string | null
  emailVerified: boolean
  familyGroupId?: string | null
}

type Theme = 'light' | 'dark' | 'system'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface UIState {
  isSSEConnected: boolean
  theme: Theme
  biometricEnabled: boolean
}

interface AuthActions {
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
  logout: () => void
}

interface UIActions {
  setSSEConnected: (connected: boolean) => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setBiometricEnabled: (enabled: boolean) => void
}

type AuthStore = AuthState & UIState & AuthActions & UIActions

// --- Store ---

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Auth State
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: true,

      // UI State
      isSSEConnected: false,
      theme: 'system' as Theme,
      biometricEnabled: false,

      // Auth Actions
      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      // UI Actions
      setSSEConnected: (connected) => set({ isSSEConnected: connected }),

      setTheme: (theme) => set({ theme }),

      toggleTheme: () =>
        set((state) => {
          const next: Theme =
            state.theme === 'light'
              ? 'dark'
              : state.theme === 'dark'
                ? 'system'
                : 'light'
          return { theme: next }
        }),

      setBiometricEnabled: (enabled) => set({ biometricEnabled: enabled }),
    }),
    {
      name: 'nestack-auth',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        biometricEnabled: state.biometricEnabled,
      }),
    },
  ),
)

// --- Selectors ---

export const selectUser = (state: AuthStore) => state.user
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated
export const selectIsLoading = (state: AuthStore) => state.isLoading
export const selectAccessToken = (state: AuthStore) => state.accessToken
export const selectTheme = (state: AuthStore) => state.theme

// --- Exported Types ---

export type { User, Theme, AuthStore }
