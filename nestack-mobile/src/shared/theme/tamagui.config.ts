import { createTamagui, createFont } from 'tamagui'
import { createAnimations } from '@tamagui/animations-react-native'
import { tokens } from './tokens'
import { colors, themePalettes, type ThemeName } from './colors'

// Pretendard 폰트 설정
const pretendardFont = createFont({
  family: 'Pretendard',
  size: {
    1: 11,
    2: 12,
    3: 13,
    4: 14,
    5: 15,
    6: 16,
    7: 18,
    8: 20,
    9: 22,
    10: 24,
    11: 28,
    12: 32,
    13: 36,
    14: 40,
    15: 48,
    16: 56,
    true: 14,
  },
  lineHeight: {
    1: 16,
    2: 18,
    3: 20,
    4: 22,
    5: 24,
    6: 26,
    7: 28,
    8: 30,
    9: 32,
    10: 36,
    11: 40,
    12: 44,
    13: 48,
    14: 52,
    15: 60,
    16: 68,
    true: 22,
  },
  weight: {
    4: '400', // Regular
    5: '500', // Medium
    6: '600', // SemiBold
    7: '700', // Bold
    8: '800', // ExtraBold (will use Bold)
    true: '400',
  },
  letterSpacing: {
    4: 0,
    5: -0.2,
    6: -0.3,
    7: -0.4,
    8: -0.5,
    true: 0,
  },
  face: {
    400: { normal: 'Pretendard-Regular' },
    500: { normal: 'Pretendard-Medium' },
    600: { normal: 'Pretendard-SemiBold' },
    700: { normal: 'Pretendard-Bold' },
    800: { normal: 'Pretendard-Bold' },
  },
})

// 토스 스타일 애니메이션
const animations = createAnimations({
  fast: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  medium: {
    type: 'spring',
    damping: 15,
    mass: 0.9,
    stiffness: 150,
  },
  slow: {
    type: 'spring',
    damping: 20,
    stiffness: 60,
  },
  bouncy: {
    type: 'spring',
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  lazy: {
    type: 'spring',
    damping: 20,
    stiffness: 60,
  },
  // 새로운 토스 스타일 애니메이션
  quick: {
    type: 'spring',
    damping: 25,
    mass: 0.8,
    stiffness: 300,
  },
  smooth: {
    type: 'spring',
    damping: 18,
    mass: 1,
    stiffness: 180,
  },
})

// 테마별 라이트/다크 테마 생성
function createThemeVariants(themeName: ThemeName) {
  const palette = themePalettes[themeName]

  const lightTheme = {
    // Background
    background: colors.white,
    backgroundHover: colors.stone[50],
    backgroundPress: colors.stone[100],
    backgroundFocus: colors.stone[50],
    backgroundStrong: colors.stone[50],
    backgroundTransparent: 'rgba(255, 255, 255, 0)',

    // Text
    color: colors.stone[900],
    colorHover: colors.stone[800],
    colorPress: colors.stone[700],
    colorFocus: colors.stone[800],
    colorTransparent: 'rgba(28, 25, 23, 0)',
    colorSecondary: colors.stone[500],
    colorTertiary: colors.stone[400],

    // Border
    borderColor: colors.stone[200],
    borderColorHover: colors.stone[300],
    borderColorFocus: palette.primary,
    borderColorPress: colors.stone[300],

    // Placeholder
    placeholderColor: colors.stone[400],

    // Primary (from theme palette)
    primary: palette.primary,
    primaryHover: palette.primaryLight,
    primaryPress: palette.primaryDark,
    primaryBackground: `${palette.primary}10`,

    // Secondary
    secondary: palette.secondary,
    secondaryHover: palette.secondaryLight,

    // Card
    cardBackground: colors.white,
    cardBorder: colors.stone[100],

    // Shadow
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowColorStrong: 'rgba(0, 0, 0, 0.12)',

    // Semantic
    success: colors.success.light,
    successBackground: colors.success.bg,
    warning: colors.warning.light,
    warningBackground: colors.warning.bg,
    error: colors.error.light,
    errorBackground: colors.error.bg,
    info: colors.info.light,
    infoBackground: colors.info.bg,
  }

  const darkTheme = {
    // Background
    background: colors.dark.background,
    backgroundHover: colors.dark.card,
    backgroundPress: colors.dark.elevated,
    backgroundFocus: colors.dark.card,
    backgroundStrong: colors.dark.card,
    backgroundTransparent: 'rgba(18, 18, 18, 0)',

    // Text
    color: colors.stone[50],
    colorHover: colors.stone[100],
    colorPress: colors.stone[200],
    colorFocus: colors.stone[100],
    colorTransparent: 'rgba(250, 250, 249, 0)',
    colorSecondary: colors.stone[400],
    colorTertiary: colors.stone[500],

    // Border
    borderColor: colors.dark.border,
    borderColorHover: colors.stone[600],
    borderColorFocus: palette.primaryLight,
    borderColorPress: colors.stone[600],

    // Placeholder
    placeholderColor: colors.stone[500],

    // Primary (lighter in dark mode)
    primary: palette.primaryLight,
    primaryHover: palette.primary,
    primaryPress: palette.primaryDark,
    primaryBackground: `${palette.primary}20`,

    // Secondary
    secondary: palette.secondaryLight,
    secondaryHover: palette.secondary,

    // Card
    cardBackground: colors.dark.card,
    cardBorder: colors.dark.border,

    // Shadow
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowColorStrong: 'rgba(0, 0, 0, 0.6)',

    // Semantic
    success: colors.success.dark,
    successBackground: colors.success.bgDark,
    warning: colors.warning.dark,
    warningBackground: colors.warning.bgDark,
    error: colors.error.dark,
    errorBackground: colors.error.bgDark,
    info: colors.info.dark,
    infoBackground: colors.info.bgDark,
  }

  return { light: lightTheme, dark: darkTheme }
}

// 모든 테마 생성
const allThemes: Record<string, Record<string, string>> = {}

// 각 테마 팔레트에 대해 라이트/다크 버전 생성
;(Object.keys(themePalettes) as ThemeName[]).forEach((themeName) => {
  const variants = createThemeVariants(themeName)
  allThemes[`${themeName}_light`] = variants.light
  allThemes[`${themeName}_dark`] = variants.dark
})

// 기본 light/dark 테마 (ocean 테마 기반)
const defaultVariants = createThemeVariants('ocean')
allThemes.light = defaultVariants.light
allThemes.dark = defaultVariants.dark

const config = createTamagui({
  tokens,
  themes: allThemes,
  animations,
  defaultTheme: 'light',
  fonts: {
    heading: pretendardFont,
    body: pretendardFont,
  },
})

export type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config
