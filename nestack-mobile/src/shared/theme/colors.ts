// 5가지 테마 팔레트
export const themePalettes = {
  ocean: {
    primary: '#0066FF',
    primaryLight: '#3385FF',
    primaryDark: '#0052CC',
    secondary: '#00D4AA',
    secondaryLight: '#33DDBB',
    secondaryDark: '#00AA88',
    gradient: ['#0066FF', '#00D4AA'],
  },
  forest: {
    primary: '#228B22',
    primaryLight: '#2E9E2E',
    primaryDark: '#1A6B1A',
    secondary: '#86EFAC',
    secondaryLight: '#A7F3C9',
    secondaryDark: '#6EE7A6',
    gradient: ['#228B22', '#86EFAC'],
  },
  sunset: {
    primary: '#F97316',
    primaryLight: '#FB923C',
    primaryDark: '#EA580C',
    secondary: '#FBBF24',
    secondaryLight: '#FCD34D',
    secondaryDark: '#F59E0B',
    gradient: ['#F97316', '#FBBF24'],
  },
  berry: {
    primary: '#8B5CF6',
    primaryLight: '#A78BFA',
    primaryDark: '#7C3AED',
    secondary: '#EC4899',
    secondaryLight: '#F472B6',
    secondaryDark: '#DB2777',
    gradient: ['#8B5CF6', '#EC4899'],
  },
  night: {
    primary: '#6366F1',
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',
    secondary: '#818CF8',
    secondaryLight: '#A5B4FC',
    secondaryDark: '#6366F1',
    gradient: ['#6366F1', '#818CF8'],
  },
} as const

export type ThemeName = keyof typeof themePalettes

// 기본 테마
export const DEFAULT_THEME: ThemeName = 'forest'

// 기존 색상 (공통)
export const colors = {
  // Neutral - Stone (Light mode)
  stone: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
  },
  // Dark mode backgrounds
  dark: {
    background: '#121212',
    card: '#1E1E1E',
    elevated: '#2D2D2D',
    border: '#3D3D3D',
  },
  // Semantic
  success: {
    light: '#10B981',
    dark: '#34D399',
    bg: '#ECFDF5',
    bgDark: '#064E3B',
  },
  warning: {
    light: '#F59E0B',
    dark: '#FBBF24',
    bg: '#FFFBEB',
    bgDark: '#78350F',
  },
  error: {
    light: '#EF4444',
    dark: '#F87171',
    bg: '#FEF2F2',
    bgDark: '#7F1D1D',
  },
  info: {
    light: '#3B82F6',
    dark: '#60A5FA',
    bg: '#EFF6FF',
    bgDark: '#1E3A5F',
  },
  // Base
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const

// 카테고리 아이콘 색상
export const categoryColors = {
  food: { bg: '#FEF3C7', icon: '#D97706' },
  transport: { bg: '#DBEAFE', icon: '#2563EB' },
  shopping: { bg: '#FCE7F3', icon: '#DB2777' },
  entertainment: { bg: '#EDE9FE', icon: '#7C3AED' },
  health: { bg: '#DCFCE7', icon: '#16A34A' },
  education: { bg: '#FEE2E2', icon: '#DC2626' },
  housing: { bg: '#F3E8FF', icon: '#9333EA' },
  savings: { bg: '#ECFDF5', icon: '#059669' },
  income: { bg: '#D1FAE5', icon: '#047857' },
  other: { bg: '#F5F5F4', icon: '#57534E' },
} as const
