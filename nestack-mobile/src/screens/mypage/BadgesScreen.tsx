import React from 'react'
import { FlatList, Pressable } from 'react-native'
import { Stack, Text } from 'tamagui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Screen } from '../../shared/components/layout/Screen'
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
          backgroundColor="#ffffff"
          borderRadius={16}
          padding={16}
          alignItems="center"
          borderWidth={1}
          borderColor={isEarned ? '#fef3c7' : '#f5f5f4'}
          opacity={isEarned ? 1 : 0.6}
        >
          <Stack
            width={64}
            height={64}
            borderRadius={32}
            backgroundColor={isEarned ? '#fef3c7' : '#f5f5f4'}
            alignItems="center"
            justifyContent="center"
            marginBottom={12}
          >
            {isEarned ? (
              <Award size={32} color="#f59e0b" />
            ) : (
              <Lock size={24} color="#a8a29e" />
            )}
          </Stack>

          <Text
            fontSize={14}
            fontWeight="600"
            color={isEarned ? '#1c1917' : '#a8a29e'}
            textAlign="center"
            numberOfLines={2}
          >
            {item.name}
          </Text>

          <Text
            fontSize={12}
            color="#78716c"
            textAlign="center"
            marginTop={4}
            numberOfLines={2}
            lineHeight={18}
          >
            {item.description}
          </Text>

          {isEarned && item.earnedAt && (
            <Text fontSize={10} color="#a8a29e" marginTop={8}>
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
          <ArrowLeft size={24} color="#1c1917" />
        </Pressable>
        <Text fontSize={18} fontWeight="700" color="#1c1917" marginLeft={12}>
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
          backgroundColor="#fef3c7"
          borderRadius={12}
          padding={14}
          alignItems="center"
        >
          <Text fontSize={24} fontWeight="800" color="#f59e0b">
            {earnedCount}
          </Text>
          <Text fontSize={12} color="#92400e" marginTop={2}>
            획득한 배지
          </Text>
        </Stack>
        <Stack
          flex={1}
          backgroundColor="#f5f5f4"
          borderRadius={12}
          padding={14}
          alignItems="center"
        >
          <Text fontSize={24} fontWeight="800" color="#78716c">
            {badges.length - earnedCount}
          </Text>
          <Text fontSize={12} color="#78716c" marginTop={2}>
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
              borderRadius={32}
              backgroundColor="#f5f5f4"
              alignItems="center"
              justifyContent="center"
              marginBottom={12}
            >
              <Award size={28} color="#a8a29e" />
            </Stack>
            <Text fontSize={14} color="#78716c">
              배지가 아직 없습니다
            </Text>
            <Text fontSize={12} color="#a8a29e" marginTop={4}>
              미션을 완료하여 배지를 획득하세요
            </Text>
          </Stack>
        }
      />
    </Screen>
  )
}
