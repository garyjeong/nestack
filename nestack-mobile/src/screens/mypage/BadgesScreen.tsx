import React from 'react'
import { FlatList, Pressable } from 'react-native'
import { Stack, Text } from 'tamagui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Screen } from '../../shared/components/layout/Screen'
import { useTheme } from '../../shared/hooks/useTheme'
import { useBadges } from '../../features/badge/hooks'
import type { Badge, UserBadge } from '../../features/badge/types'
import type { MyPageStackParamList } from '../../app/navigation/types'
import { ArrowLeft, Award, Lock } from 'lucide-react-native'

type Props = NativeStackScreenProps<MyPageStackParamList, 'Badges'>

interface DisplayBadge extends Badge {
  earned: boolean
  earnedAt: string | null
}

function toDisplayBadges(
  earnedBadges: UserBadge[],
  availableBadges: Badge[],
): DisplayBadge[] {
  const earned: DisplayBadge[] = earnedBadges.map((ub) => ({
    ...ub.badge,
    earned: true,
    earnedAt: ub.earnedAt,
  }))
  const available: DisplayBadge[] = availableBadges.map((b) => ({
    ...b,
    earned: false,
    earnedAt: null,
  }))
  return [...earned, ...available]
}

export default function BadgesScreen({ navigation }: Props) {
  const { colors } = useTheme()
  const { earnedBadges, availableBadges, totalEarned } = useBadges()

  const badges = toDisplayBadges(earnedBadges, availableBadges)
  const earnedCount = totalEarned

  const renderBadge = ({ item }: { item: DisplayBadge }) => {
    const isEarned = item.earned
    return (
      <Stack
        flex={1}
        maxWidth="50%"
        padding={6}
      >
        <Stack
          backgroundColor={colors.card}
          borderRadius={4}
          padding={16}
          alignItems="center"
          borderWidth={1}
          borderColor={isEarned ? `${colors.warning}30` : colors.border}
          opacity={isEarned ? 1 : 0.6}
        >
          <Stack
            width={64}
            height={64}
            borderRadius={4}
            backgroundColor={isEarned ? `${colors.warning}20` : colors.backgroundSecondary}
            alignItems="center"
            justifyContent="center"
            marginBottom={12}
          >
            {isEarned ? (
              <Award size={32} color={colors.warning} />
            ) : (
              <Lock size={24} color={colors.textTertiary} />
            )}
          </Stack>

          <Text
            fontSize={14}
            fontWeight="600"
            color={isEarned ? colors.text : colors.textTertiary}
            textAlign="center"
            numberOfLines={2}
          >
            {item.name}
          </Text>

          <Text
            fontSize={12}
            color={colors.textSecondary}
            textAlign="center"
            marginTop={4}
            numberOfLines={2}
            lineHeight={18}
          >
            {item.description}
          </Text>

          {isEarned && item.earnedAt && (
            <Text fontSize={10} color={colors.textTertiary} marginTop={8}>
              획득: {new Date(item.earnedAt).toLocaleDateString('ko-KR')}
            </Text>
          )}
        </Stack>
      </Stack>
    )
  }

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
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Text fontSize={18} fontWeight="700" color={colors.text} marginLeft={12}>
          배지
        </Text>
      </Stack>

      {/* Summary */}
      <Stack
        flexDirection="row"
        paddingHorizontal={20}
        marginBottom={8}
        gap={12}
      >
        <Stack
          flex={1}
          backgroundColor={`${colors.warning}20`}
          borderRadius={4}
          padding={14}
          alignItems="center"
        >
          <Text fontSize={24} fontWeight="800" color={colors.warning}>
            {earnedCount}
          </Text>
          <Text fontSize={12} color={colors.warning} marginTop={2}>
            획득한 배지
          </Text>
        </Stack>
        <Stack
          flex={1}
          backgroundColor={colors.backgroundSecondary}
          borderRadius={4}
          padding={14}
          alignItems="center"
        >
          <Text fontSize={24} fontWeight="800" color={colors.textSecondary}>
            {badges.length - earnedCount}
          </Text>
          <Text fontSize={12} color={colors.textSecondary} marginTop={2}>
            미획득 배지
          </Text>
        </Stack>
      </Stack>

      {/* Badge Grid */}
      <FlatList
        data={badges}
        keyExtractor={(item) => item.id}
        renderItem={renderBadge}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 12, paddingBottom: 40 }}
        ListEmptyComponent={
          <Stack paddingVertical={60} alignItems="center">
            <Stack
              width={64}
              height={64}
              borderRadius={4}
              backgroundColor={colors.backgroundSecondary}
              alignItems="center"
              justifyContent="center"
              marginBottom={12}
            >
              <Award size={28} color={colors.textTertiary} />
            </Stack>
            <Text fontSize={14} color={colors.textSecondary}>
              배지가 아직 없습니다
            </Text>
            <Text fontSize={12} color={colors.textTertiary} marginTop={4}>
              미션을 완료하여 배지를 획득하세요
            </Text>
          </Stack>
        }
      />
    </Screen>
  )
}
