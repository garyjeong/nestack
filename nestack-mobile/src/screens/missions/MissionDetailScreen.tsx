import React, { useCallback } from 'react'
import { ScrollView, Pressable, RefreshControl } from 'react-native'
import { Stack, Text } from 'tamagui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Screen } from '../../shared/components/layout/Screen'
import { useTheme } from '../../shared/hooks/useTheme'
import { useMission, useMissionTransactions } from '../../features/mission/hooks'
import { formatCurrency, formatCompactCurrency, formatDate } from '../../shared/utils/format'
import type { Transaction } from '../../features/finance/types'
import type { MissionStackParamList } from '../../app/navigation/types'
import {
  ArrowLeft,
  Edit3,
  Calendar,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownLeft,
  ListChecks,
} from 'lucide-react-native'
import { ActivityIndicator } from 'react-native'

type Props = NativeStackScreenProps<MissionStackParamList, 'MissionDetail'>

export default function MissionDetailScreen({ navigation, route }: Props) {
  const { colors } = useTheme()
  const { id } = route.params

  const {
    data: mission,
    isLoading,
    refetch,
  } = useMission(id)

  const { data: transactionsData } = useMissionTransactions(id)

  const transactions = transactionsData?.transactions ?? []

  const onRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  if (isLoading || !mission) {
    return (
      <Screen edges={['top']}>
        <Stack flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color={colors.primary} />
        </Stack>
      </Screen>
    )
  }

  const progressPercent = Math.min(mission.progress, 100)
  const circumference = 2 * Math.PI * 50

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress': return '진행중'
      case 'completed': return '완료'
      case 'failed': return '실패'
      case 'pending': return '대기'
      case 'cancelled': return '취소'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return colors.primary
      case 'completed': return colors.info
      case 'failed': return colors.error
      case 'pending': return colors.warning
      default: return colors.textSecondary
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'main': return '메인 미션'
      case 'monthly': return '월간 미션'
      case 'weekly': return '주간 미션'
      case 'daily': return '일일 미션'
      default: return type
    }
  }

  return (
    <Screen edges={['top']}>
      {/* Header */}
      <Stack
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal={16}
        paddingVertical={12}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Text fontSize={18} fontWeight="700" color={colors.text}>
          미션 상세
        </Text>
        <Pressable onPress={() => navigation.navigate('MissionEdit', { id })}>
          <Edit3 size={22} color={colors.primary} />
        </Pressable>
      </Stack>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Progress Circle */}
        <Stack alignItems="center" paddingVertical={24}>
          <Stack
            width={140}
            height={140}
            borderRadius={70}
            backgroundColor={`${colors.primary}15`}
            alignItems="center"
            justifyContent="center"
            borderWidth={8}
            borderColor={colors.primary}
          >
            <Text fontSize={28} fontWeight="800" color={colors.primary}>
              {Math.round(progressPercent)}%
            </Text>
          </Stack>
          <Text fontSize={14} color={colors.textSecondary} marginTop={12}>
            {formatCompactCurrency(mission.currentAmount)} /{' '}
            {formatCompactCurrency(mission.targetAmount)}
          </Text>
        </Stack>

        {/* Mission Name */}
        <Stack paddingHorizontal={20}>
          <Text fontSize={22} fontWeight="700" color={colors.text} textAlign="center">
            {mission.name}
          </Text>
          {mission.description && (
            <Text
              fontSize={14}
              color={colors.textSecondary}
              textAlign="center"
              marginTop={8}
              lineHeight={22}
            >
              {mission.description}
            </Text>
          )}
        </Stack>

        {/* Info Cards */}
        <Stack paddingHorizontal={20} marginTop={24} gap={12}>
          <Stack
            backgroundColor={colors.card}
            borderRadius={4}
            padding={16}
            borderWidth={1}
            borderColor={colors.border}
          >
            <Stack flexDirection="row" gap={16}>
              <Stack flex={1} gap={16}>
                {/* Status */}
                <Stack flexDirection="row" alignItems="center" gap={10}>
                  <Stack
                    width={36}
                    height={36}
                    borderRadius={4}
                    backgroundColor={getStatusColor(mission.status) + '15'}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Target size={18} color={getStatusColor(mission.status)} />
                  </Stack>
                  <Stack>
                    <Text fontSize={11} color={colors.textTertiary}>상태</Text>
                    <Text fontSize={14} fontWeight="600" color={colors.text}>
                      {getStatusLabel(mission.status)}
                    </Text>
                  </Stack>
                </Stack>

                {/* Start Date */}
                <Stack flexDirection="row" alignItems="center" gap={10}>
                  <Stack
                    width={36}
                    height={36}
                    borderRadius={4}
                    backgroundColor={`${colors.primary}15`}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Calendar size={18} color={colors.primary} />
                  </Stack>
                  <Stack>
                    <Text fontSize={11} color={colors.textTertiary}>시작일</Text>
                    <Text fontSize={14} fontWeight="600" color={colors.text}>
                      {formatDate(mission.startDate)}
                    </Text>
                  </Stack>
                </Stack>
              </Stack>

              <Stack flex={1} gap={16}>
                {/* Type */}
                <Stack flexDirection="row" alignItems="center" gap={10}>
                  <Stack
                    width={36}
                    height={36}
                    borderRadius={4}
                    backgroundColor={`${colors.info}15`}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <ListChecks size={18} color={colors.info} />
                  </Stack>
                  <Stack>
                    <Text fontSize={11} color={colors.textTertiary}>유형</Text>
                    <Text fontSize={14} fontWeight="600" color={colors.text}>
                      {getTypeLabel(mission.type)}
                    </Text>
                  </Stack>
                </Stack>

                {/* End Date / D-day */}
                <Stack flexDirection="row" alignItems="center" gap={10}>
                  <Stack
                    width={36}
                    height={36}
                    borderRadius={4}
                    backgroundColor={`${colors.warning}15`}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Clock size={18} color={colors.warning} />
                  </Stack>
                  <Stack>
                    <Text fontSize={11} color={colors.textTertiary}>종료일</Text>
                    <Text fontSize={14} fontWeight="600" color={colors.text}>
                      {formatDate(mission.endDate)} (D-{mission.daysRemaining})
                    </Text>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        {/* Sub Missions */}
        {mission.subMissions && mission.subMissions.length > 0 && (
          <Stack paddingHorizontal={20} marginTop={24}>
            <Text fontSize={17} fontWeight="700" color={colors.text} marginBottom={12}>
              하위 미션
            </Text>
            <Stack gap={8}>
              {mission.subMissions.map((sub) => (
                <Pressable
                  key={sub.id}
                  onPress={() => navigation.push('MissionDetail', { id: sub.id })}
                >
                  <Stack
                    backgroundColor={colors.card}
                    borderRadius={4}
                    padding={14}
                    borderWidth={1}
                    borderColor={colors.border}
                    flexDirection="row"
                    alignItems="center"
                  >
                    <Stack flex={1}>
                      <Text fontSize={14} fontWeight="600" color={colors.text}>
                        {sub.name}
                      </Text>
                      <Stack
                        height={4}
                        borderRadius={2}
                        backgroundColor={colors.border}
                        marginTop={8}
                        overflow="hidden"
                      >
                        <Stack
                          height={4}
                          borderRadius={2}
                          backgroundColor={colors.primary}
                          width={`${Math.min(sub.progress, 100)}%` as any}
                        />
                      </Stack>
                    </Stack>
                    <Text fontSize={13} fontWeight="600" color={colors.primary} marginLeft={12}>
                      {Math.round(sub.progress)}%
                    </Text>
                  </Stack>
                </Pressable>
              ))}
            </Stack>
          </Stack>
        )}

        {/* Linked Transactions */}
        <Stack paddingHorizontal={20} marginTop={24}>
          <Text fontSize={17} fontWeight="700" color={colors.text} marginBottom={12}>
            연결된 거래
          </Text>
          <Stack
            backgroundColor={colors.card}
            borderRadius={4}
            paddingHorizontal={16}
            borderWidth={1}
            borderColor={colors.border}
          >
            {transactions.length > 0 ? (
              transactions.map((tx: Transaction) => {
                const isDeposit = tx.transactionType === 'deposit'
                return (
                  <Stack
                    key={tx.id}
                    flexDirection="row"
                    alignItems="center"
                    paddingVertical={12}
                    borderBottomWidth={1}
                    borderBottomColor={colors.border}
                  >
                    <Stack
                      width={36}
                      height={36}
                      borderRadius={4}
                      backgroundColor={isDeposit ? `${colors.success}15` : `${colors.error}15`}
                      alignItems="center"
                      justifyContent="center"
                    >
                      {isDeposit ? (
                        <ArrowDownLeft size={16} color={colors.success} />
                      ) : (
                        <ArrowUpRight size={16} color={colors.error} />
                      )}
                    </Stack>
                    <Stack flex={1} marginLeft={10}>
                      <Text fontSize={13} fontWeight="500" color={colors.text} numberOfLines={1}>
                        {tx.description}
                      </Text>
                      <Text fontSize={11} color={colors.textTertiary} marginTop={2}>
                        {formatDate(tx.transactionDate)}
                      </Text>
                    </Stack>
                    <Text
                      fontSize={13}
                      fontWeight="600"
                      color={isDeposit ? colors.success : colors.error}
                    >
                      {isDeposit ? '+' : '-'}{formatCurrency(tx.amount)}
                    </Text>
                  </Stack>
                )
              })
            ) : (
              <Stack paddingVertical={24} alignItems="center">
                <Text fontSize={13} color={colors.textTertiary}>
                  연결된 거래가 없습니다
                </Text>
              </Stack>
            )}
          </Stack>
        </Stack>
      </ScrollView>
    </Screen>
  )
}
