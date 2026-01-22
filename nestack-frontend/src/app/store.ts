import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  profileImage?: string | null
  emailVerified: boolean
  familyGroupId?: string | null
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthActions {
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
  logout: () => void
}

interface UIState {
  sidebarOpen: boolean
  isSSEConnected: boolean
}

interface UIActions {
  toggleSidebar: () => void
  setSSEConnected: (connected: boolean) => void
}

type AppState = AuthState & AuthActions & UIState & UIActions

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth State
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: true,

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

      // UI State
      sidebarOpen: false,
      isSSEConnected: false,

      // UI Actions
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSSEConnected: (connected) => set({ isSSEConnected: connected }),
    }),
    {
      name: 'nestack-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Selectors
export const selectUser = (state: AppState) => state.user
export const selectIsAuthenticated = (state: AppState) => state.isAuthenticated
export const selectIsLoading = (state: AppState) => state.isLoading
export const selectAccessToken = (state: AppState) => state.accessToken
