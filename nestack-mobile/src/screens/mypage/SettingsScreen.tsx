import React, { useState } from 'react'
import { ScrollView, Pressable, Switch } from 'react-native'
import { Stack, Text } from 'tamagui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Screen } from '../../shared/components/layout/Screen'
import { useAuthStore } from '../../store/authStore'
import type { MyPageStackParamList } from '../../app/navigation/types'
import {
  ArrowLeft,
  Moon,
  Bell,
  Fingerprint,
  Info,
  ChevronRight,
  Shield,
  FileText,
  HelpCircle,
} from 'lucide-react-native'

type Props = NativeStackScreenProps<MyPageStackParamList, 'Settings'>

export default function SettingsScreen({ navigation }: Props) {
  const theme = useAuthStore((state) => state.theme)
  const toggleTheme = useAuthStore((state) => state.toggleTheme)
  const biometricEnabled = useAuthStore((state) => state.biometricEnabled)
  const setBiometricEnabled = useAuthStore((state) => state.setBiometricEnabled)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const isDarkMode = theme === 'dark'

  return (
    <Screen edges={['top']}>
      {/* Header */}
      <Stack
        flexDirection="row"
        alignItems="center"
        paddingHorizontal={16}
        paddingVertical={12}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#1c1917" />
        </Pressable>
        <Text fontSize={18} fontWeight="700" color="#1c1917" marginLeft={12}>
          설정
        </Text>
      </Stack>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 24 }}
      >
        {/* Appearance */}
        <Stack gap={8}>
          <Text fontSize={12} fontWeight="600" color="#a8a29e" marginLeft={4}>
            화면
          </Text>
          <Stack
            backgroundColor="#ffffff"
            borderRadius={16}
            borderWidth={1}
            borderColor="#f5f5f4"
            overflow="hidden"
          >
            {/* Dark Mode */}
            <Stack
              flexDirection="row"
              alignItems="center"
              paddingHorizontal={16}
              paddingVertical={14}
              borderBottomWidth={1}
              borderBottomColor="#f5f5f4"
            >
              <Stack
                width={36}
                height={36}
                borderRadius={10}
                backgroundColor="#f5f5f4"
                alignItems="center"
                justifyContent="center"
              >
                <Moon size={18} color="#78716c" />
              </Stack>
              <Text fontSize={15} fontWeight="500" color="#1c1917" flex={1} marginLeft={12}>
                다크 모드
              </Text>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#e7e5e4', true: '#059669' }}
                thumbColor="#ffffff"
              />
            </Stack>

            {/* Notifications */}
            <Stack
              flexDirection="row"
              alignItems="center"
              paddingHorizontal={16}
              paddingVertical={14}
              borderBottomWidth={1}
              borderBottomColor="#f5f5f4"
            >
              <Stack
                width={36}
                height={36}
                borderRadius={10}
                backgroundColor="#f5f5f4"
                alignItems="center"
                justifyContent="center"
              >
                <Bell size={18} color="#78716c" />
              </Stack>
              <Text fontSize={15} fontWeight="500" color="#1c1917" flex={1} marginLeft={12}>
                알림
              </Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#e7e5e4', true: '#059669' }}
                thumbColor="#ffffff"
              />
            </Stack>

            {/* Biometric */}
            <Stack
              flexDirection="row"
              alignItems="center"
              paddingHorizontal={16}
              paddingVertical={14}
            >
              <Stack
                width={36}
                height={36}
                borderRadius={10}
                backgroundColor="#f5f5f4"
                alignItems="center"
                justifyContent="center"
              >
                <Fingerprint size={18} color="#78716c" />
              </Stack>
              <Text fontSize={15} fontWeight="500" color="#1c1917" flex={1} marginLeft={12}>
                생체 인증
              </Text>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: '#e7e5e4', true: '#059669' }}
                thumbColor="#ffffff"
              />
            </Stack>
          </Stack>
        </Stack>

        {/* Information */}
        <Stack gap={8}>
          <Text fontSize={12} fontWeight="600" color="#a8a29e" marginLeft={4}>
            정보
          </Text>
          <Stack
            backgroundColor="#ffffff"
            borderRadius={16}
            borderWidth={1}
            borderColor="#f5f5f4"
            overflow="hidden"
          >
            {/* Privacy Policy */}
            <Pressable onPress={() => {}}>
              <Stack
                flexDirection="row"
                alignItems="center"
                paddingHorizontal={16}
                paddingVertical={14}
                borderBottomWidth={1}
                borderBottomColor="#f5f5f4"
              >
                <Stack
                  width={36}
                  height={36}
                  borderRadius={10}
                  backgroundColor="#f5f5f4"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Shield size={18} color="#78716c" />
                </Stack>
                <Text fontSize={15} fontWeight="500" color="#1c1917" flex={1} marginLeft={12}>
                  개인정보 처리방침
                </Text>
                <ChevronRight size={18} color="#d6d3d1" />
              </Stack>
            </Pressable>

            {/* Terms of Service */}
            <Pressable onPress={() => {}}>
              <Stack
                flexDirection="row"
                alignItems="center"
                paddingHorizontal={16}
                paddingVertical={14}
                borderBottomWidth={1}
                borderBottomColor="#f5f5f4"
              >
                <Stack
                  width={36}
                  height={36}
                  borderRadius={10}
                  backgroundColor="#f5f5f4"
                  alignItems="center"
                  justifyContent="center"
                >
                  <FileText size={18} color="#78716c" />
                </Stack>
                <Text fontSize={15} fontWeight="500" color="#1c1917" flex={1} marginLeft={12}>
                  이용약관
                </Text>
                <ChevronRight size={18} color="#d6d3d1" />
              </Stack>
            </Pressable>

            {/* Help */}
            <Pressable onPress={() => {}}>
              <Stack
                flexDirection="row"
                alignItems="center"
                paddingHorizontal={16}
                paddingVertical={14}
                borderBottomWidth={1}
                borderBottomColor="#f5f5f4"
              >
                <Stack
                  width={36}
                  height={36}
                  borderRadius={10}
                  backgroundColor="#f5f5f4"
                  alignItems="center"
                  justifyContent="center"
                >
                  <HelpCircle size={18} color="#78716c" />
                </Stack>
                <Text fontSize={15} fontWeight="500" color="#1c1917" flex={1} marginLeft={12}>
                  도움말
                </Text>
                <ChevronRight size={18} color="#d6d3d1" />
              </Stack>
            </Pressable>

            {/* Version */}
            <Stack
              flexDirection="row"
              alignItems="center"
              paddingHorizontal={16}
              paddingVertical={14}
            >
              <Stack
                width={36}
                height={36}
                borderRadius={10}
                backgroundColor="#f5f5f4"
                alignItems="center"
                justifyContent="center"
              >
                <Info size={18} color="#78716c" />
              </Stack>
              <Text fontSize={15} fontWeight="500" color="#1c1917" flex={1} marginLeft={12}>
                버전 정보
              </Text>
              <Text fontSize={14} color="#a8a29e">
                v1.0.0
              </Text>
            </Stack>
          </Stack>
        </Stack>
      </ScrollView>
    </Screen>
  )
}
