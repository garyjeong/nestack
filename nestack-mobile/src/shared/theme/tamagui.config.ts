import { createTamagui } from 'tamagui'
import { createAnimations } from '@tamagui/animations-react-native'
import { tokens } from './tokens'
import { colors } from './colors'

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
})

const lightTheme = {
  background: colors.stone[50],
  backgroundHover: colors.stone[100],
  backgroundPress: colors.stone[200],
  backgroundFocus: colors.stone[100],
  backgroundStrong: colors.white,
  backgroundTransparent: 'rgba(250, 250, 249, 0)',

  color: colors.stone[900],
  colorHover: colors.stone[800],
  colorPress: colors.stone[700],
  colorFocus: colors.stone[800],
  colorTransparent: 'rgba(28, 25, 23, 0)',

  borderColor: colors.stone[200],
  borderColorHover: colors.stone[300],
  borderColorFocus: colors.primary[500],
  borderColorPress: colors.stone[300],

  placeholderColor: colors.stone[400],

  // Semantic
  primary: colors.primary[500],
  primaryHover: colors.primary[600],
  accent: colors.accent[500],

  // Card
  cardBackground: colors.white,
  cardBorder: colors.stone[100],

  // Shadow
  shadowColor: 'rgba(0, 0, 0, 0.05)',
  shadowColorHover: 'rgba(0, 0, 0, 0.1)',
}

const darkTheme = {
  background: colors.stone[900],
  backgroundHover: colors.stone[800],
  backgroundPress: colors.stone[700],
  backgroundFocus: colors.stone[800],
  backgroundStrong: colors.stone[800],
  backgroundTransparent: 'rgba(28, 25, 23, 0)',

  color: colors.stone[50],
  colorHover: colors.stone[100],
  colorPress: colors.stone[200],
  colorFocus: colors.stone[100],
  colorTransparent: 'rgba(250, 250, 249, 0)',

  borderColor: colors.stone[700],
  borderColorHover: colors.stone[600],
  borderColorFocus: colors.primary[500],
  borderColorPress: colors.stone[600],

  placeholderColor: colors.stone[500],

  // Semantic
  primary: colors.primary[400],
  primaryHover: colors.primary[300],
  accent: colors.accent[400],

  // Card
  cardBackground: colors.stone[800],
  cardBorder: colors.stone[700],

  // Shadow
  shadowColor: 'rgba(0, 0, 0, 0.3)',
  shadowColorHover: 'rgba(0, 0, 0, 0.4)',
}

const config = createTamagui({
  tokens,
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  animations,
  defaultTheme: 'light',
})

export type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config
