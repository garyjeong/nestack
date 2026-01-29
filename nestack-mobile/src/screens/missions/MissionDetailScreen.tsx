import React, { useCallback } from 'react'
import { ScrollView, Pressable, RefreshControl } from 'react-native'
import { Stack, Text } from 'tamagui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Screen } from '../../shared/components/layout/Screen'
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
          <ActivityIndicator size="large" color="#059669" />
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
      case 'in_progress': return '#059669'
      case 'completed': return '#3b82f6'
      case 'failed': return '#ef4444'
      case 'pending': return '#f59e0b'
      default: return '#78716c'
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
          <ArrowLeft size={24} color="#1c1917" />
        </Pressable>
        <Text fontSize={18} fontWeight="700" color="#1c1917">
          미션 상세
        </Text>
        <Pressable onPress={() => navigation.navigate('MissionEdit', { id })}>
          <Edit3 size={22} color="#059669" />
        </Pressable>
      </Stack>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#059669" />
        }
      >
        {/* Progress Circle */}
        <Stack alignItems="center" paddingVertical={24}>
          <Stack
            width={140}
            height={140}
            borderRadius={70}
            backgroundColor="#ecfdf5"
            alignItems="center"
            justifyContent="center"
            borderWidth={8}
            borderColor="#059669"
          >
            <Text fontSize={28} fontWeight="800" color="#059669">
              {Math.round(progressPercent)}%
            </Text>
          </Stack>
          <Text fontSize={14} color="#78716c" marginTop={12}>
            {formatCompactCurrency(mission.currentAmount)} /{' '}
            {formatCompactCurrency(mission.targetAmount)}
          </Text>
        </Stack>

        {/* Mission Name */}
        <Stack paddingHorizontal={20}>
          <Text fontSize={22} fontWeight="700" color="#1c1917" textAlign="center">
            {mission.name}
          </Text>
          {mission.description && (
            <Text
              fontSize={14}
              color="#78716c"
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
            backgroundColor="#ffffff"
            borderRadius={16}
            padding={16}
            borderWidth={1}
            borderColor="#f5f5f4"
          >
            <Stack flexDirection="row" gap={16}>
              <Stack flex={1} gap={16}>
                {/* Status */}
                <Stack flexDirection="row" alignItems="center" gap={10}>
                  <Stack
                    width={36}
                    height={36}
                    borderRadius={10}
                    backgroundColor={getStatusColor(mission.status) + '15'}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Target size={18} color={getStatusColor(mission.status)} />
                  </Stack>
                  <Stack>
                    <Text fontSize={11} color="#a8a29e">상태</Text>
                    <Text fontSize={14} fontWeight="600" color="#1c1917">
                      {getStatusLabel(mission.status)}
                    </Text>
                  </Stack>
                </Stack>

                {/* Start Date */}
                <Stack flexDirection="row" alignItems="center" gap={10}>
                  <Stack
                    width={36}
                    height={36}
                    borderRadius={10}
                    backgroundColor="#ecfdf5"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Calendar size={18} color="#059669" />
                  </Stack>
                  <Stack>
                    <Text fontSize={11} color="#a8a29e">시작일</Text>
                    <Text fontSize={14} fontWeight="600" color="#1c1917">
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
                    borderRadius={10}
                    backgroundColor="#eff6ff"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <ListChecks size={18} color="#3b82f6" />
                  </Stack>
                  <Stack>
                    <Text fontSize={11} color="#a8a29e">유형</Text>
                    <Text fontSize={14} fontWeight="600" color="#1c1917">
                      {getTypeLabel(mission.type)}
                    </Text>
                  </Stack>
                </Stack>

                {/* End Date / D-day */}
                <Stack flexDirection="row" alignItems="center" gap={10}>
                  <Stack
                    width={36}
                    height={36}
                    borderRadius={10}
                    backgroundColor="#fef3c7"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Clock size={18} color="#f59e0b" />
                  </Stack>
                  <Stack>
                    <Text fontSize={11} color="#a8a29e">종료일</Text>
                    <Text fontSize={14} fontWeight="600" color="#1c1917">
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
            <Text fontSize={17} fontWeight="700" color="#1c1917" marginBottom={12}>
              하위 미션
            </Text>
            <Stack gap={8}>
              {mission.subMissions.map((sub) => (
                <Pressable
                  key={sub.id}
                  onPress={() => navigation.push('MissionDetail', { id: sub.id })}
                >
                  <Stack
                    backgroundColor="#ffffff"
                    borderRadius={12}
                    padding={14}
                    borderWidth={1}
                    borderColor="#f5f5f4"
                    flexDirection="row"
                    alignItems="center"
                  >
                    <Stack flex={1}>
                      <Text fontSize={14} fontWeight="600" color="#1c1917">
                        {sub.name}
                      </Text>
                      <Stack
                        height={4}
                        borderRadius={2}
                        backgroundColor="#f5f5f4"
                        marginTop={8}
                        overflow="hidden"
                      >
                        <Stack
                          height={4}
                          borderRadius={2}
                          backgroundColor="#059669"
                          width={`${Math.min(sub.progress, 100)}%` as any}
                        />
                      </Stack>
                    </Stack>
                    <Text fontSize={13} fontWeight="600" color="#059669" marginLeft={12}>
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
          <Text fontSize={17} fontWeight="700" color="#1c1917" marginBottom={12}>
            연결된 거래
          </Text>
          <Stack
            backgroundColor="#ffffff"
            borderRadius={16}
            paddingHorizontal={16}
            borderWidth={1}
            borderColor="#f5f5f4"
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
                    borderBottomColor="#f5f5f4"
                  >
                    <Stack
                      width={36}
                      height={36}
                      borderRadius={18}
                      backgroundColor={isDeposit ? '#ecfdf5' : '#fff1f2'}
                      alignItems="center"
                      justifyContent="center"
                    >
                      {isDeposit ? (
                        <ArrowDownLeft size={16} color="#059669" />
                      ) : (
                        <ArrowUpRight size={16} color="#ef4444" />
                      )}
                    </Stack>
                    <Stack flex={1} marginLeft={10}>
                      <Text fontSize={13} fontWeight="500" color="#1c1917" numberOfLines={1}>
                        {tx.description}
                      </Text>
                      <Text fontSize={11} color="#a8a29e" marginTop={2}>
                        {formatDate(tx.transactionDate)}
                      </Text>
                    </Stack>
                    <Text
                      fontSize={13}
                      fontWeight="600"
                      color={isDeposit ? '#059669' : '#ef4444'}
                    >
                      {isDeposit ? '+' : '-'}{formatCurrency(tx.amount)}
                    </Text>
                  </Stack>
                )
              })
            ) : (
              <Stack paddingVertical={24} alignItems="center">
                <Text fontSize={13} color="#a8a29e">
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
