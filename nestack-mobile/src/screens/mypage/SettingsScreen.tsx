import React, { useState } from 'react'
import { ScrollView, Pressable, Switch } from 'react-native'
import { Stack, Text } from 'tamagui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import { Screen } from '../../shared/components/layout/Screen'
import { Card } from '../../shared/components/ui/Card'
import { useTheme, useThemeStore } from '../../shared/hooks/useTheme'
import { themePalettes, type ThemeName } from '../../shared/theme/colors'
import { useAuthStore } from '../../store/authStore'
import type { MyPageStackParamList } from '../../app/navigation/types'
import {
  ArrowLeft,
  Moon,
  Sun,
  Smartphone,
  Bell,
  Fingerprint,
  Info,
  ChevronRight,
  Shield,
  FileText,
  HelpCircle,
  Palette,
  Check,
} from 'lucide-react-native'

type Props = NativeStackScreenProps<MyPageStackParamList, 'Settings'>

type ColorMode = 'light' | 'dark' | 'system'

const getColorModeIcon = (key: ColorMode, color: string) => {
  switch (key) {
    case 'light':
      return <Sun size={18} color={color} />
    case 'dark':
      return <Moon size={18} color={color} />
    case 'system':
      return <Smartphone size={18} color={color} />
  }
}

const COLOR_MODE_OPTIONS: { key: ColorMode; label: string }[] = [
  { key: 'light', label: '라이트' },
  { key: 'dark', label: '다크' },
  { key: 'system', label: '시스템' },
]

const THEME_OPTIONS: { key: ThemeName; label: string }[] = [
  { key: 'ocean', label: '오션' },
  { key: 'forest', label: '포레스트' },
  { key: 'sunset', label: '선셋' },
  { key: 'berry', label: '베리' },
  { key: 'night', label: '나이트' },
]

export default function SettingsScreen({ navigation }: Props) {
  const { colors } = useTheme()
  const { themeName, colorMode, setThemeName, setColorMode } = useThemeStore()
  const biometricEnabled = useAuthStore((state) => state.biometricEnabled)
  const setBiometricEnabled = useAuthStore((state) => state.setBiometricEnabled)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  return (
    <Screen edges={['top']}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)}>
        <Stack
          flexDirection="row"
          alignItems="center"
          paddingHorizontal={16}
          paddingVertical={14}
        >
          <Pressable onPress={() => navigation.goBack()}>
            <Stack
              width={40}
              height={40}
              borderRadius={12}
              backgroundColor={colors.backgroundSecondary}
              alignItems="center"
              justifyContent="center"
            >
              <ArrowLeft size={22} color={colors.text} />
            </Stack>
          </Pressable>
          <Text fontSize={20} fontWeight="700" color={colors.text} marginLeft={14}>
            설정
          </Text>
        </Stack>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, gap: 28 }}
      >
        {/* Theme Color Selection */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Stack gap={12}>
            <Stack flexDirection="row" alignItems="center" gap={8} marginLeft={4}>
              <Palette size={16} color={colors.primary} />
              <Text fontSize={13} fontWeight="600" color={colors.textSecondary}>
                테마 색상
              </Text>
            </Stack>
            <Card variant="default">
              <Stack padding={16} gap={12}>
                <Stack flexDirection="row" flexWrap="wrap" gap={10}>
                  {THEME_OPTIONS.map((option) => {
                    const isSelected = themeName === option.key
                    const themeColor = themePalettes[option.key].primary
                    return (
                      <Pressable
                        key={option.key}
                        onPress={() => setThemeName(option.key)}
                      >
                        <Stack
                          width={56}
                          height={56}
                          borderRadius={16}
                          backgroundColor={themeColor}
                          alignItems="center"
                          justifyContent="center"
                          borderWidth={isSelected ? 3 : 0}
                          borderColor={colors.text}
                        >
                          {isSelected && <Check size={24} color="#ffffff" />}
                        </Stack>
                        <Text
                          fontSize={11}
                          fontWeight={isSelected ? '700' : '500'}
                          color={isSelected ? colors.text : colors.textSecondary}
                          textAlign="center"
                          marginTop={6}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    )
                  })}
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Animated.View>

        {/* Color Mode Selection */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <Stack gap={12}>
            <Stack flexDirection="row" alignItems="center" gap={8} marginLeft={4}>
              <Moon size={16} color={colors.primary} />
              <Text fontSize={13} fontWeight="600" color={colors.textSecondary}>
                화면 모드
              </Text>
            </Stack>
            <Card variant="default">
              <Stack padding={6}>
                <Stack flexDirection="row" gap={6}>
                  {COLOR_MODE_OPTIONS.map((option) => {
                    const isSelected = colorMode === option.key
                    const iconColor = isSelected ? '#ffffff' : colors.textSecondary
                    return (
                      <Pressable
                        key={option.key}
                        onPress={() => setColorMode(option.key)}
                        style={{ flex: 1 }}
                      >
                        <Stack
                          paddingVertical={14}
                          borderRadius={12}
                          backgroundColor={isSelected ? colors.primary : 'transparent'}
                          alignItems="center"
                          justifyContent="center"
                          gap={6}
                        >
                          {getColorModeIcon(option.key, iconColor)}
                          <Text
                            fontSize={13}
                            fontWeight={isSelected ? '700' : '500'}
                            color={isSelected ? '#ffffff' : colors.textSecondary}
                          >
                            {option.label}
                          </Text>
                        </Stack>
                      </Pressable>
                    )
                  })}
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Animated.View>

        {/* Preferences */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Stack gap={12}>
            <Text fontSize={13} fontWeight="600" color={colors.textSecondary} marginLeft={4}>
              환경 설정
            </Text>
            <Card variant="default">
              <Stack>
                {/* Notifications */}
                <Stack
                  flexDirection="row"
                  alignItems="center"
                  paddingHorizontal={16}
                  paddingVertical={16}
                  borderBottomWidth={1}
                  borderBottomColor={colors.border}
                >
                  <Stack
                    width={40}
                    height={40}
                    borderRadius={12}
                    backgroundColor={`${colors.info}15`}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Bell size={20} color={colors.info} />
                  </Stack>
                  <Text fontSize={15} fontWeight="600" color={colors.text} flex={1} marginLeft={14}>
                    알림
                  </Text>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#ffffff"
                  />
                </Stack>

                {/* Biometric */}
                <Stack
                  flexDirection="row"
                  alignItems="center"
                  paddingHorizontal={16}
                  paddingVertical={16}
                >
                  <Stack
                    width={40}
                    height={40}
                    borderRadius={12}
                    backgroundColor={`${colors.success}15`}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Fingerprint size={20} color={colors.success} />
                  </Stack>
                  <Text fontSize={15} fontWeight="600" color={colors.text} flex={1} marginLeft={14}>
                    생체 인증
                  </Text>
                  <Switch
                    value={biometricEnabled}
                    onValueChange={setBiometricEnabled}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#ffffff"
                  />
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Animated.View>

        {/* Information */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <Stack gap={12}>
            <Text fontSize={13} fontWeight="600" color={colors.textSecondary} marginLeft={4}>
              정보
            </Text>
            <Card variant="default">
              <Stack>
                {/* Privacy Policy */}
                <Pressable onPress={() => {}}>
                  <Stack
                    flexDirection="row"
                    alignItems="center"
                    paddingHorizontal={16}
                    paddingVertical={16}
                    borderBottomWidth={1}
                    borderBottomColor={colors.border}
                  >
                    <Stack
                      width={40}
                      height={40}
                      borderRadius={12}
                      backgroundColor={colors.backgroundSecondary}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Shield size={20} color={colors.textSecondary} />
                    </Stack>
                    <Text fontSize={15} fontWeight="600" color={colors.text} flex={1} marginLeft={14}>
                      개인정보 처리방침
                    </Text>
                    <ChevronRight size={20} color={colors.border} />
                  </Stack>
                </Pressable>

                {/* Terms of Service */}
                <Pressable onPress={() => {}}>
                  <Stack
                    flexDirection="row"
                    alignItems="center"
                    paddingHorizontal={16}
                    paddingVertical={16}
                    borderBottomWidth={1}
                    borderBottomColor={colors.border}
                  >
                    <Stack
                      width={40}
                      height={40}
                      borderRadius={12}
                      backgroundColor={colors.backgroundSecondary}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <FileText size={20} color={colors.textSecondary} />
                    </Stack>
                    <Text fontSize={15} fontWeight="600" color={colors.text} flex={1} marginLeft={14}>
                      이용약관
                    </Text>
                    <ChevronRight size={20} color={colors.border} />
                  </Stack>
                </Pressable>

                {/* Help */}
                <Pressable onPress={() => {}}>
                  <Stack
                    flexDirection="row"
                    alignItems="center"
                    paddingHorizontal={16}
                    paddingVertical={16}
                    borderBottomWidth={1}
                    borderBottomColor={colors.border}
                  >
                    <Stack
                      width={40}
                      height={40}
                      borderRadius={12}
                      backgroundColor={colors.backgroundSecondary}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <HelpCircle size={20} color={colors.textSecondary} />
                    </Stack>
                    <Text fontSize={15} fontWeight="600" color={colors.text} flex={1} marginLeft={14}>
                      도움말
                    </Text>
                    <ChevronRight size={20} color={colors.border} />
                  </Stack>
                </Pressable>

                {/* Version */}
                <Stack
                  flexDirection="row"
                  alignItems="center"
                  paddingHorizontal={16}
                  paddingVertical={16}
                >
                  <Stack
                    width={40}
                    height={40}
                    borderRadius={12}
                    backgroundColor={colors.backgroundSecondary}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Info size={20} color={colors.textSecondary} />
                  </Stack>
                  <Text fontSize={15} fontWeight="600" color={colors.text} flex={1} marginLeft={14}>
                    버전 정보
                  </Text>
                  <Text fontSize={14} fontWeight="500" color={colors.textTertiary}>
                    v1.0.0
                  </Text>
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Animated.View>
      </ScrollView>
    </Screen>
  )
}
