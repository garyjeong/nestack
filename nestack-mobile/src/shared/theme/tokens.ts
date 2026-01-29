import { createTokens } from 'tamagui'
import { colors, themePalettes, DEFAULT_THEME } from './colors'

// 기본 테마의 색상을 사용
const defaultPalette = themePalettes[DEFAULT_THEME]

export const tokens = createTokens({
  color: {
    // Primary (from default theme)
    primary: defaultPalette.primary,
    primaryLight: defaultPalette.primaryLight,
    primaryDark: defaultPalette.primaryDark,

    // Secondary
    secondary: defaultPalette.secondary,
    secondaryLight: defaultPalette.secondaryLight,
    secondaryDark: defaultPalette.secondaryDark,

    // Neutral - Stone
    stone50: colors.stone[50],
    stone100: colors.stone[100],
    stone200: colors.stone[200],
    stone300: colors.stone[300],
    stone400: colors.stone[400],
    stone500: colors.stone[500],
    stone600: colors.stone[600],
    stone700: colors.stone[700],
    stone800: colors.stone[800],
    stone900: colors.stone[900],

    // Dark mode
    darkBackground: colors.dark.background,
    darkCard: colors.dark.card,
    darkElevated: colors.dark.elevated,
    darkBorder: colors.dark.border,

    // Semantic
    success: colors.success.light,
    successDark: colors.success.dark,
    successBg: colors.success.bg,
    successBgDark: colors.success.bgDark,

    warning: colors.warning.light,
    warningDark: colors.warning.dark,
    warningBg: colors.warning.bg,
    warningBgDark: colors.warning.bgDark,

    error: colors.error.light,
    errorDark: colors.error.dark,
    errorBg: colors.error.bg,
    errorBgDark: colors.error.bgDark,

    info: colors.info.light,
    infoDark: colors.info.dark,
    infoBg: colors.info.bg,
    infoBgDark: colors.info.bgDark,

    white: colors.white,
    black: colors.black,
    transparent: colors.transparent,

    // Semantic aliases (light mode defaults)
    background: colors.white,
    backgroundCard: colors.white,
    backgroundSecondary: colors.stone[50],
    text: colors.stone[900],
    textSecondary: colors.stone[500],
    textTertiary: colors.stone[400],
    border: colors.stone[200],
    borderSecondary: colors.stone[100],
  },
  space: {
    0: 0,
    0.5: 2,
    1: 4,
    1.5: 6,
    2: 8,
    2.5: 10,
    3: 12,
    3.5: 14,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    12: 48,
    14: 56,
    16: 64,
    20: 80,
    24: 96,
    true: 16, // default
  },
  size: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
    14: 56,
    16: 64,
    20: 80,
    true: 44, // default touch target
  },
  radius: {
    0: 0,
    1: 4,
    2: 6,
    3: 8,
    4: 10,
    5: 12,
    6: 14,
    7: 16,
    8: 18,
    9: 20,
    10: 24,
    11: 28,
    12: 32,
    true: 14, // default (lg)
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
  },
})
