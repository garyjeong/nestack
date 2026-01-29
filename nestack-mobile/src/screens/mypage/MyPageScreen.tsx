import React from 'react'
import { ScrollView, Pressable, FlatList } from 'react-native'
import { Stack, Text } from 'tamagui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated'
import { Screen } from '../../shared/components/layout/Screen'
import { Card } from '../../shared/components/ui/Card'
import { Button } from '../../shared/components/ui/Button'
import { useTheme } from '../../shared/hooks/useTheme'
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
  Palette,
  Bell,
  Shield,
  HelpCircle,
} from 'lucide-react-native'

type Props = NativeStackScreenProps<MyPageStackParamList, 'MyPage'>

export default function MyPageScreen({ navigation }: Props) {
  const { colors, palette } = useTheme()
  const user = useAuthStore((state) => state.user)
  const partner = useAuthStore((state) => state.partner)
  const { logout, isLoading: isLoggingOut } = useAuth()
  const { earnedBadges, totalEarned } = useBadges()
  const { familyGroup, inviteCode } = useFamily()

  const familyPartner = familyGroup?.members?.find(
    (m) => m.userId !== user?.id,
  )?.user

  const displayPartner = partner || familyPartner

  const menuItems = [
    {
      icon: <Edit3 size={20} color={colors.primary} />,
      label: '프로필 수정',
      bgColor: `${colors.primary}15`,
      onPress: () => navigation.navigate('ProfileEdit'),
    },
    {
      icon: <Award size={20} color={colors.warning} />,
      label: '획득한 배지',
      bgColor: `${colors.warning}15`,
      badge: totalEarned > 0 ? `${totalEarned}개` : undefined,
      onPress: () => navigation.navigate('Badges'),
    },
    {
      icon: <Users size={20} color={colors.info} />,
      label: '가족 관리',
      bgColor: `${colors.info}15`,
      onPress: () => navigation.navigate('FamilySettings'),
    },
    {
      icon: <Settings size={20} color={colors.textSecondary} />,
      label: '설정',
      bgColor: colors.backgroundSecondary,
      onPress: () => navigation.navigate('Settings'),
    },
  ]

  const renderBadgeItem = ({ item, index }: { item: UserBadge; index: number }) => (
    <Animated.View entering={FadeInRight.delay(index * 50).duration(300)}>
      <Stack
        width={80}
        alignItems="center"
        marginRight={12}
      >
        <Stack
          width={60}
          height={60}
          borderRadius={18}
          backgroundColor={`${colors.warning}15`}
          alignItems="center"
          justifyContent="center"
          marginBottom={8}
        >
          <Award size={28} color={colors.warning} />
        </Stack>
        <Text
          fontSize={12}
          fontWeight="500"
          color={colors.text}
          textAlign="center"
          numberOfLines={2}
        >
          {item.badge.name}
        </Text>
      </Stack>
    </Animated.View>
  )

  return (
    <Screen edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)}>
          <Stack
            paddingHorizontal={20}
            paddingTop={16}
            paddingBottom={8}
          >
            <Text fontSize={26} fontWeight="800" color={colors.text}>
              마이페이지
            </Text>
          </Stack>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Stack paddingHorizontal={20} marginTop={12}>
            <Card variant="elevated">
              <Stack padding={20}>
                <Stack flexDirection="row" alignItems="center" gap={16}>
                  {/* Avatar */}
                  <Stack
                    width={72}
                    height={72}
                    borderRadius={22}
                    backgroundColor={`${colors.primary}20`}
                    alignItems="center"
                    justifyContent="center"
                    borderWidth={3}
                    borderColor={colors.primary}
                  >
                    <Text fontSize={30} fontWeight="800" color={colors.primary}>
                      {user?.name?.charAt(0) ?? 'N'}
                    </Text>
                  </Stack>

                  <Stack flex={1}>
                    <Text fontSize={22} fontWeight="800" color={colors.text}>
                      {user?.name ?? '사용자'}
                    </Text>
                    <Stack flexDirection="row" alignItems="center" gap={6} marginTop={6}>
                      <Mail size={14} color={colors.textTertiary} />
                      <Text fontSize={13} color={colors.textSecondary} flex={1} numberOfLines={1}>
                        {user?.email ?? ''}
                      </Text>
                      {user?.emailVerified && (
                        <Stack
                          paddingHorizontal={6}
                          paddingVertical={2}
                          borderRadius={6}
                          backgroundColor={`${colors.success}15`}
                          flexDirection="row"
                          alignItems="center"
                          gap={4}
                        >
                          <CheckCircle size={12} color={colors.success} />
                          <Text fontSize={10} color={colors.success} fontWeight="600">
                            인증됨
                          </Text>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Animated.View>

        {/* Partner Card */}
        {displayPartner && (
          <Animated.View entering={FadeInDown.delay(150).duration(500)}>
            <Stack paddingHorizontal={20} marginTop={12}>
              <Card variant="default">
                <Stack
                  padding={16}
                  flexDirection="row"
                  alignItems="center"
                  gap={14}
                >
                  <Stack
                    width={50}
                    height={50}
                    borderRadius={16}
                    backgroundColor={`${palette.secondary}20`}
                    alignItems="center"
                    justifyContent="center"
                    borderWidth={2}
                    borderColor={palette.secondary}
                  >
                    <Heart size={24} color={palette.secondary} />
                  </Stack>
                  <Stack flex={1}>
                    <Text fontSize={12} color={colors.textTertiary} fontWeight="500">
                      파트너
                    </Text>
                    <Text fontSize={16} fontWeight="700" color={colors.text} marginTop={2}>
                      {displayPartner.name}
                    </Text>
                  </Stack>
                  <Stack
                    paddingHorizontal={12}
                    paddingVertical={6}
                    borderRadius={10}
                    backgroundColor={`${colors.primary}15`}
                  >
                    <Text fontSize={12} color={colors.primary} fontWeight="700">
                      {familyGroup?.name ?? '가족'}
                    </Text>
                  </Stack>
                </Stack>
              </Card>
            </Stack>
          </Animated.View>
        )}

        {/* Badges */}
        {earnedBadges.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Stack marginTop={28}>
              <Stack
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                paddingHorizontal={20}
                marginBottom={14}
              >
                <Text fontSize={18} fontWeight="700" color={colors.text}>
                  획득한 배지
                </Text>
                <Pressable onPress={() => navigation.navigate('Badges')}>
                  <Stack flexDirection="row" alignItems="center">
                    <Text fontSize={14} fontWeight="600" color={colors.primary}>
                      전체보기
                    </Text>
                    <ChevronRight size={18} color={colors.primary} />
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
          </Animated.View>
        )}

        {/* Menu Items */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Stack paddingHorizontal={20} marginTop={28}>
            <Text fontSize={13} fontWeight="600" color={colors.textTertiary} marginBottom={12}>
              메뉴
            </Text>
            <Card variant="default">
              <Stack>
                {menuItems.map((item, index) => (
                  <Pressable key={item.label} onPress={item.onPress}>
                    <Stack
                      flexDirection="row"
                      alignItems="center"
                      paddingHorizontal={16}
                      paddingVertical={16}
                      borderBottomWidth={index < menuItems.length - 1 ? 1 : 0}
                      borderBottomColor={colors.border}
                    >
                      <Stack
                        width={40}
                        height={40}
                        borderRadius={12}
                        backgroundColor={item.bgColor}
                        alignItems="center"
                        justifyContent="center"
                      >
                        {item.icon}
                      </Stack>
                      <Text
                        fontSize={15}
                        fontWeight="600"
                        color={colors.text}
                        flex={1}
                        marginLeft={14}
                      >
                        {item.label}
                      </Text>
                      {item.badge && (
                        <Stack
                          paddingHorizontal={10}
                          paddingVertical={4}
                          borderRadius={8}
                          backgroundColor={`${colors.warning}15`}
                          marginRight={8}
                        >
                          <Text fontSize={12} fontWeight="700" color={colors.warning}>
                            {item.badge}
                          </Text>
                        </Stack>
                      )}
                      <ChevronRight size={20} color={colors.border} />
                    </Stack>
                  </Pressable>
                ))}
              </Stack>
            </Card>
          </Stack>
        </Animated.View>

        {/* Logout */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Stack paddingHorizontal={20} marginTop={28}>
            <Button
              variant="danger"
              onPress={() => logout()}
              isLoading={isLoggingOut}
              fullWidth
              size="lg"
              leftIcon={<LogOut size={18} color="#ffffff" />}
            >
              로그아웃
            </Button>
          </Stack>
        </Animated.View>

        {/* Version */}
        <Animated.View entering={FadeIn.delay(500).duration(400)}>
          <Text
            fontSize={12}
            color={colors.textTertiary}
            textAlign="center"
            marginTop={32}
          >
            Nestack v1.0.0
          </Text>
        </Animated.View>
      </ScrollView>
    </Screen>
  )
}
