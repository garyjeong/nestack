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

type Theme = 'light' | 'dark' | 'system'

interface UIState {
  sidebarOpen: boolean
  isSSEConnected: boolean
  theme: Theme
}

interface UIActions {
  toggleSidebar: () => void
  setSSEConnected: (connected: boolean) => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

type AppState = AuthState & AuthActions & UIState & UIActions

// Helper function to apply theme to document
function applyTheme(theme: Theme) {
  const root = document.documentElement
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  if (isDark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// Initialize theme on app load
function initializeTheme(theme: Theme) {
  applyTheme(theme)

  // Listen for system theme changes
  if (theme === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => applyTheme('system')
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }
}

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
      theme: 'system' as Theme,

      // UI Actions
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSSEConnected: (connected) => set({ isSSEConnected: connected }),

      setTheme: (theme) => {
        // Apply theme to document
        applyTheme(theme)
        set({ theme })
      },

      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : state.theme === 'dark' ? 'system' : 'light'
          applyTheme(newTheme)
          return { theme: newTheme }
        }),
    }),
    {
      name: 'nestack-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        // Initialize theme after rehydration
        if (state?.theme) {
          initializeTheme(state.theme)
        }
      },
    }
  )
)

// Selectors
export const selectUser = (state: AppState) => state.user
export const selectIsAuthenticated = (state: AppState) => state.isAuthenticated
export const selectIsLoading = (state: AppState) => state.isLoading
export const selectAccessToken = (state: AppState) => state.accessToken
export const selectTheme = (state: AppState) => state.theme

// Export types
export type { Theme }
