import React from 'react'
import { ScrollView, Pressable, FlatList } from 'react-native'
import { Stack, Text } from 'tamagui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Screen } from '../../shared/components/layout/Screen'
import { Button } from '../../shared/components/ui/Button'
import { useAuthStore } from '../../store/authStore'
import { useBadges } from '../../features/badge/hooks'
import { useFamily } from '../../features/family/hooks'
import { useAuth } from '../../features/auth/hooks'
import type { UserBadge } from '../../features/badge/types'
import type { MyPageStackParamList } from '../../app/navigation/types'
import {
  Mail,
  CheckCircle,
  Users,
  Award,
  Settings,
  ChevronRight,
  LogOut,
  Edit3,
  Heart,
} from 'lucide-react-native'

type Props = NativeStackScreenProps<MyPageStackParamList, 'MyPage'>

interface MenuItem {
  icon: React.ReactNode
  label: string
  onPress: () => void
}

export default function MyPageScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user)
  const { logout, isLoading: isLoggingOut } = useAuth()
  const { earnedBadges, totalEarned } = useBadges()
  const { familyGroup, inviteCode } = useFamily()

  const partner = familyGroup?.members?.find(
    (m) => m.userId !== user?.id,
  )?.user

  const menuItems: MenuItem[] = [
    {
      icon: <Edit3 size={20} color="#059669" />,
      label: '프로필 수정',
      onPress: () => navigation.navigate('ProfileEdit'),
    },
    {
      icon: <Award size={20} color="#f59e0b" />,
      label: '배지',
      onPress: () => navigation.navigate('Badges'),
    },
    {
      icon: <Users size={20} color="#3b82f6" />,
      label: '가족 설정',
      onPress: () => navigation.navigate('FamilySettings'),
    },
    {
      icon: <Settings size={20} color="#78716c" />,
      label: '설정',
      onPress: () => navigation.navigate('Settings'),
    },
  ]

  const renderBadgeItem = ({ item }: { item: UserBadge }) => (
    <Stack
      width={72}
      alignItems="center"
      marginRight={12}
    >
      <Stack
        width={56}
        height={56}
        borderRadius={28}
        backgroundColor="#fef3c7"
        alignItems="center"
        justifyContent="center"
        marginBottom={6}
      >
        <Award size={28} color="#f59e0b" />
      </Stack>
      <Text
        fontSize={11}
        color="#1c1917"
        textAlign="center"
        numberOfLines={2}
      >
        {item.badge.name}
      </Text>
    </Stack>
  )

  return (
    <Screen edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <Stack
          paddingHorizontal={20}
          paddingTop={16}
          paddingBottom={8}
        >
          <Text fontSize={24} fontWeight="800" color="#1c1917">
            마이페이지
          </Text>
        </Stack>

        {/* Profile Card */}
        <Stack paddingHorizontal={20} marginTop={8}>
          <Stack
            backgroundColor="#ffffff"
            borderRadius={16}
            padding={20}
            borderWidth={1}
            borderColor="#f5f5f4"
          >
            <Stack flexDirection="row" alignItems="center" gap={16}>
              {/* Avatar */}
              <Stack
                width={64}
                height={64}
                borderRadius={32}
                backgroundColor="#d1fae5"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={28} fontWeight="700" color="#059669">
                  {user?.name?.charAt(0) ?? 'N'}
                </Text>
              </Stack>

              <Stack flex={1}>
                <Text fontSize={20} fontWeight="700" color="#1c1917">
                  {user?.name ?? ''}
                </Text>
                <Stack flexDirection="row" alignItems="center" gap={4} marginTop={4}>
                  <Mail size={14} color="#a8a29e" />
                  <Text fontSize={13} color="#78716c">
                    {user?.email ?? ''}
                  </Text>
                  {user?.emailVerified && (
                    <CheckCircle size={14} color="#059669" />
                  )}
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        {/* Partner Card */}
        {partner && (
          <Stack paddingHorizontal={20} marginTop={12}>
            <Stack
              backgroundColor="#ffffff"
              borderRadius={16}
              padding={16}
              borderWidth={1}
              borderColor="#f5f5f4"
              flexDirection="row"
              alignItems="center"
              gap={12}
            >
              <Stack
                width={44}
                height={44}
                borderRadius={22}
                backgroundColor="#fce7f3"
                alignItems="center"
                justifyContent="center"
              >
                <Heart size={22} color="#ec4899" />
              </Stack>
              <Stack flex={1}>
                <Text fontSize={12} color="#a8a29e">
                  파트너
                </Text>
                <Text fontSize={15} fontWeight="600" color="#1c1917" marginTop={2}>
                  {partner.name}
                </Text>
              </Stack>
              <Stack
                paddingHorizontal={10}
                paddingVertical={4}
                borderRadius={12}
                backgroundColor="#ecfdf5"
              >
                <Text fontSize={12} color="#059669" fontWeight="500">
                  {familyGroup?.name ?? '가족'}
                </Text>
              </Stack>
            </Stack>
          </Stack>
        )}

        {/* Badges */}
        {earnedBadges.length > 0 && (
          <Stack marginTop={24}>
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingHorizontal={20}
              marginBottom={12}
            >
              <Text fontSize={17} fontWeight="700" color="#1c1917">
                배지
              </Text>
              <Pressable onPress={() => navigation.navigate('Badges')}>
                <Stack flexDirection="row" alignItems="center">
                  <Text fontSize={13} color="#059669">
                    전체보기
                  </Text>
                  <ChevronRight size={16} color="#059669" />
                </Stack>
              </Pressable>
            </Stack>

            <FlatList
              data={earnedBadges.slice(0, 10)}
              keyExtractor={(item) => item.id}
              renderItem={renderBadgeItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            />
          </Stack>
        )}

        {/* Menu Items */}
        <Stack paddingHorizontal={20} marginTop={24} gap={2}>
          <Text fontSize={12} fontWeight="600" color="#a8a29e" marginBottom={8}>
            메뉴
          </Text>
          <Stack
            backgroundColor="#ffffff"
            borderRadius={16}
            borderWidth={1}
            borderColor="#f5f5f4"
            overflow="hidden"
          >
            {menuItems.map((item, index) => (
              <Pressable key={item.label} onPress={item.onPress}>
                <Stack
                  flexDirection="row"
                  alignItems="center"
                  paddingHorizontal={16}
                  paddingVertical={14}
                  borderBottomWidth={index < menuItems.length - 1 ? 1 : 0}
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
                    {item.icon}
                  </Stack>
                  <Text
                    fontSize={15}
                    fontWeight="500"
                    color="#1c1917"
                    flex={1}
                    marginLeft={12}
                  >
                    {item.label}
                  </Text>
                  <ChevronRight size={18} color="#d6d3d1" />
                </Stack>
              </Pressable>
            ))}
          </Stack>
        </Stack>

        {/* Logout */}
        <Stack paddingHorizontal={20} marginTop={24}>
          <Button
            variant="outline"
            onPress={() => logout()}
            isLoading={isLoggingOut}
            fullWidth
            size="lg"
          >
            <Stack flexDirection="row" alignItems="center" gap={8}>
              <LogOut size={18} color="#ef4444" />
              <Text fontSize={15} fontWeight="600" color="#ef4444">
                로그아웃
              </Text>
            </Stack>
          </Button>
        </Stack>

        {/* Version */}
        <Text
          fontSize={12}
          color="#d6d3d1"
          textAlign="center"
          marginTop={24}
        >
          Nestack v1.0.0
        </Text>
      </ScrollView>
    </Screen>
  )
}
