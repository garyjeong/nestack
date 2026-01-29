import { useCallback, useEffect, useMemo } from 'react'
import { useColorScheme } from 'react-native'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { storage } from '@/shared/utils/storage'
import { themePalettes, colors, DEFAULT_THEME, type ThemeName } from '@/shared/theme/colors'

export type ColorMode = 'light' | 'dark' | 'system'

interface ThemeState {
  themeName: ThemeName
  colorMode: ColorMode
  setThemeName: (name: ThemeName) => void
  setColorMode: (mode: ColorMode) => void
}

// Zustand store with MMKV persistence
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeName: DEFAULT_THEME,
      colorMode: 'system',
      setThemeName: (name) => set({ themeName: name }),
      setColorMode: (mode) => set({ colorMode: mode }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const value = storage.getString(name)
          return value ? JSON.parse(value) : null
        },
        setItem: (name, value) => {
          storage.set(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          storage.remove(name)
        },
      })),
    }
  )
)

// Main hook for theme management
export function useTheme() {
  const systemColorScheme = useColorScheme()
  const { themeName, colorMode, setThemeName, setColorMode } = useThemeStore()

  // Determine actual dark mode status
  const isDark = useMemo(() => {
    if (colorMode === 'system') {
      return systemColorScheme === 'dark'
    }
    return colorMode === 'dark'
  }, [colorMode, systemColorScheme])

  // Get current theme palette
  const palette = useMemo(() => themePalettes[themeName], [themeName])

  // Get theme colors based on dark mode
  const themeColors = useMemo(() => {
    return {
      // Primary colors from selected theme
      primary: palette.primary,
      primaryLight: palette.primaryLight,
      primaryDark: palette.primaryDark,
      secondary: palette.secondary,
      gradient: palette.gradient,

      // Background colors
      background: isDark ? colors.dark.background : colors.white,
      backgroundSecondary: isDark ? colors.dark.card : colors.stone[50],
      card: isDark ? colors.dark.card : colors.white,
      cardElevated: isDark ? colors.dark.elevated : colors.white,

      // Text colors
      text: isDark ? colors.stone[50] : colors.stone[900],
      textSecondary: isDark ? colors.stone[400] : colors.stone[500],
      textTertiary: isDark ? colors.stone[500] : colors.stone[400],

      // Border colors
      border: isDark ? colors.dark.border : colors.stone[200],
      borderLight: isDark ? colors.stone[700] : colors.stone[100],

      // Semantic colors
      success: isDark ? colors.success.dark : colors.success.light,
      successBg: isDark ? colors.success.bgDark : colors.success.bg,
      warning: isDark ? colors.warning.dark : colors.warning.light,
      warningBg: isDark ? colors.warning.bgDark : colors.warning.bg,
      error: isDark ? colors.error.dark : colors.error.light,
      errorBg: isDark ? colors.error.bgDark : colors.error.bg,
      info: isDark ? colors.info.dark : colors.info.light,
      infoBg: isDark ? colors.info.bgDark : colors.info.bg,

      // Tab bar
      tabBarBackground: isDark ? colors.dark.card : colors.white,
      tabBarBorder: isDark ? colors.dark.border : colors.stone[200],
      tabBarActive: palette.primary,
      tabBarInactive: isDark ? colors.stone[500] : colors.stone[400],

      // Shadows
      shadowColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.08)',
    }
  }, [palette, isDark])

  // Toggle between light and dark
  const toggleColorMode = useCallback(() => {
    if (colorMode === 'light') {
      setColorMode('dark')
    } else if (colorMode === 'dark') {
      setColorMode('system')
    } else {
      setColorMode('light')
    }
  }, [colorMode, setColorMode])

  return {
    themeName,
    colorMode,
    isDark,
    palette,
    colors: themeColors,
    setThemeName,
    setColorMode,
    toggleColorMode,
  }
}

// Simple hook for getting colors only
export function useColors() {
  const { colors } = useTheme()
  return colors
}

// Hook for checking dark mode
export function useIsDark() {
  const { isDark } = useTheme()
  return isDark
}
