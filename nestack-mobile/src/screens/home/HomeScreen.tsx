import React, { useCallback } from 'react'
import { FlatList, Pressable, RefreshControl } from 'react-native'
import { Stack, Text } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Screen } from '../../shared/components/layout/Screen'
import { useAuthStore } from '../../store/authStore'
import { useMissionSummary, useMissions } from '../../features/mission/hooks'
import { useFinanceSummary, useTransactions } from '../../features/finance/hooks'
import { formatCurrency, formatCompactCurrency, formatRelativeDate } from '../../shared/utils/format'
import type { Mission } from '../../features/mission/types'
import type { Transaction } from '../../features/finance/types'
import type { MissionStackParamList } from '../../app/navigation/types'
import {
  Target,
  TrendingUp,
  CreditCard,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react-native'

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user)
  const navigation = useNavigation<NativeStackNavigationProp<MissionStackParamList>>()

  const {
    data: missionSummary,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useMissionSummary()

  const {
    missions: activeMissionsData,
    isLoading: isMissionsLoading,
    refetch: refetchMissions,
  } = useMissions({ status: 'in_progress', limit: 10 })

  const {
    data: financeSummary,
    isLoading: isFinanceLoading,
    refetch: refetchFinance,
  } = useFinanceSummary()

  const {
    transactions: recentTransactionsData,
    isLoading: isTransactionsLoading,
    refetch: refetchTransactions,
  } = useTransactions({ limit: 5 })

  const isRefreshing =
    isSummaryLoading || isMissionsLoading || isFinanceLoading || isTransactionsLoading

  const onRefresh = useCallback(() => {
    refetchSummary()
    refetchMissions()
    refetchFinance()
    refetchTransactions()
  }, [refetchSummary, refetchMissions, refetchFinance, refetchTransactions])

  const activeMissions = activeMissionsData
  const recentTransactions = recentTransactionsData

  const renderMissionCard = ({ item }: { item: Mission }) => (
    <Pressable
      onPress={() =>
        navigation.navigate('MissionDetail' as any, { id: item.id })
      }
    >
      <Stack
        width={200}
        backgroundColor="#ffffff"
        borderRadius={16}
        padding={16}
        marginRight={12}
        borderWidth={1}
        borderColor="#f5f5f4"
      >
        <Stack
          width={40}
          height={40}
          borderRadius={12}
          backgroundColor="#ecfdf5"
          alignItems="center"
          justifyContent="center"
          marginBottom={12}
        >
          <Target size={20} color="#059669" />
        </Stack>
        <Text
          fontSize={14}
          fontWeight="600"
          color="#1c1917"
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text fontSize={12} color="#78716c" marginTop={4}>
          {formatCompactCurrency(item.currentAmount)} /{' '}
          {formatCompactCurrency(item.targetAmount)}
        </Text>

        {/* Progress bar */}
        <Stack
          height={6}
          borderRadius={3}
          backgroundColor="#f5f5f4"
          marginTop={12}
          overflow="hidden"
        >
          <Stack
            height={6}
            borderRadius={3}
            backgroundColor="#059669"
            width={`${Math.min(item.progress, 100)}%` as any}
          />
        </Stack>
        <Stack flexDirection="row" justifyContent="space-between" marginTop={6}>
          <Text fontSize={11} color="#a8a29e">
            {Math.round(item.progress)}%
          </Text>
          <Text fontSize={11} color="#a8a29e">
            D-{item.daysRemaining}
          </Text>
        </Stack>
      </Stack>
    </Pressable>
  )

  const renderTransactionItem = (transaction: Transaction) => {
    const isDeposit = transaction.transactionType === 'deposit'
    return (
      <Stack
        key={transaction.id}
        flexDirection="row"
        alignItems="center"
        paddingVertical={12}
        borderBottomWidth={1}
        borderBottomColor="#f5f5f4"
      >
        <Stack
          width={40}
          height={40}
          borderRadius={20}
          backgroundColor={isDeposit ? '#ecfdf5' : '#fff1f2'}
          alignItems="center"
          justifyContent="center"
        >
          {isDeposit ? (
            <ArrowDownLeft size={18} color="#059669" />
          ) : (
            <ArrowUpRight size={18} color="#ef4444" />
          )}
        </Stack>

        <Stack flex={1} marginLeft={12}>
          <Text fontSize={14} fontWeight="500" color="#1c1917" numberOfLines={1}>
            {transaction.description}
          </Text>
          <Text fontSize={12} color="#a8a29e" marginTop={2}>
            {formatRelativeDate(transaction.transactionDate)}
          </Text>
        </Stack>

        <Text
          fontSize={14}
          fontWeight="600"
          color={isDeposit ? '#059669' : '#ef4444'}
        >
          {isDeposit ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </Text>
      </Stack>
    )
  }

  return (
    <Screen edges={['top']}>
      <FlatList
        data={[]}
        renderItem={null}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#059669" />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListHeaderComponent={
          <Stack>
            {/* Greeting */}
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingHorizontal={20}
              paddingTop={16}
              paddingBottom={8}
            >
              <Stack>
                <Text fontSize={22} fontWeight="700" color="#1c1917">
                  안녕하세요, {user?.name ?? ''}님
                </Text>
                <Text fontSize={13} color="#78716c" marginTop={4}>
                  오늘도 목표를 향해 함께해요
                </Text>
              </Stack>

              {/* Avatar */}
              <Stack
                width={44}
                height={44}
                borderRadius={22}
                backgroundColor="#d1fae5"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={18} fontWeight="700" color="#059669">
                  {user?.name?.charAt(0) ?? 'N'}
                </Text>
              </Stack>
            </Stack>

            {/* Total Savings Card */}
            <Stack paddingHorizontal={20} marginTop={16}>
              <Stack
                backgroundColor="#059669"
                borderRadius={20}
                padding={24}
                overflow="hidden"
              >
                <Text fontSize={13} color="#a7f3d0" fontWeight="500">
                  총 저축액
                </Text>
                <Text
                  fontSize={32}
                  fontWeight="800"
                  color="#ffffff"
                  marginTop={8}
                >
                  {formatCurrency(missionSummary?.totalSavedAmount ?? 0)}
                </Text>

                <Stack flexDirection="row" gap={16} marginTop={16}>
                  <Stack flex={1}>
                    <Text fontSize={11} color="#a7f3d0">
                      이번 달 목표
                    </Text>
                    <Text fontSize={15} fontWeight="600" color="#ffffff" marginTop={2}>
                      {formatCompactCurrency(missionSummary?.monthlyTarget ?? 0)}
                    </Text>
                  </Stack>
                  <Stack flex={1}>
                    <Text fontSize={11} color="#a7f3d0">
                      달성률
                    </Text>
                    <Text fontSize={15} fontWeight="600" color="#ffffff" marginTop={2}>
                      {Math.round(missionSummary?.monthlyProgress ?? 0)}%
                    </Text>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>

            {/* Quick Stats */}
            <Stack
              flexDirection="row"
              paddingHorizontal={20}
              gap={12}
              marginTop={16}
            >
              <Stack
                flex={1}
                backgroundColor="#ffffff"
                borderRadius={14}
                padding={16}
                alignItems="center"
                borderWidth={1}
                borderColor="#f5f5f4"
              >
                <Stack
                  width={36}
                  height={36}
                  borderRadius={10}
                  backgroundColor="#ecfdf5"
                  alignItems="center"
                  justifyContent="center"
                  marginBottom={8}
                >
                  <Target size={18} color="#059669" />
                </Stack>
                <Text fontSize={20} fontWeight="700" color="#1c1917">
                  {missionSummary?.activeMissions ?? 0}
                </Text>
                <Text fontSize={11} color="#78716c" marginTop={2}>
                  진행 중 미션
                </Text>
              </Stack>

              <Stack
                flex={1}
                backgroundColor="#ffffff"
                borderRadius={14}
                padding={16}
                alignItems="center"
                borderWidth={1}
                borderColor="#f5f5f4"
              >
                <Stack
                  width={36}
                  height={36}
                  borderRadius={10}
                  backgroundColor="#eff6ff"
                  alignItems="center"
                  justifyContent="center"
                  marginBottom={8}
                >
                  <CreditCard size={18} color="#3b82f6" />
                </Stack>
                <Text fontSize={20} fontWeight="700" color="#1c1917">
                  {financeSummary?.connectedAccounts ?? 0}
                </Text>
                <Text fontSize={11} color="#78716c" marginTop={2}>
                  연결 계좌
                </Text>
              </Stack>

              <Stack
                flex={1}
                backgroundColor="#ffffff"
                borderRadius={14}
                padding={16}
                alignItems="center"
                borderWidth={1}
                borderColor="#f5f5f4"
              >
                <Stack
                  width={36}
                  height={36}
                  borderRadius={10}
                  backgroundColor="#fef3c7"
                  alignItems="center"
                  justifyContent="center"
                  marginBottom={8}
                >
                  <TrendingUp size={18} color="#f59e0b" />
                </Stack>
                <Text fontSize={20} fontWeight="700" color="#1c1917">
                  {missionSummary?.completedMissions ?? 0}
                </Text>
                <Text fontSize={11} color="#78716c" marginTop={2}>
                  완료 미션
                </Text>
              </Stack>
            </Stack>

            {/* Active Missions */}
            {activeMissions.length > 0 && (
              <Stack marginTop={24}>
                <Stack
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  paddingHorizontal={20}
                  marginBottom={12}
                >
                  <Text fontSize={17} fontWeight="700" color="#1c1917">
                    진행 중인 미션
                  </Text>
                  <Pressable
                    onPress={() =>
                      navigation.navigate('Missions' as any)
                    }
                  >
                    <Stack flexDirection="row" alignItems="center">
                      <Text fontSize={13} color="#059669">
                        전체보기
                      </Text>
                      <ChevronRight size={16} color="#059669" />
                    </Stack>
                  </Pressable>
                </Stack>

                <FlatList
                  data={activeMissions}
                  keyExtractor={(item) => item.id}
                  renderItem={renderMissionCard}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                />
              </Stack>
            )}

            {/* Recent Transactions */}
            <Stack marginTop={24} paddingHorizontal={20}>
              <Stack
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                marginBottom={8}
              >
                <Text fontSize={17} fontWeight="700" color="#1c1917">
                  최근 거래
                </Text>
                <Pressable
                  onPress={() =>
                    navigation.navigate('TransactionList' as any, {})
                  }
                >
                  <Stack flexDirection="row" alignItems="center">
                    <Text fontSize={13} color="#059669">
                      전체보기
                    </Text>
                    <ChevronRight size={16} color="#059669" />
                  </Stack>
                </Pressable>
              </Stack>

              <Stack
                backgroundColor="#ffffff"
                borderRadius={16}
                paddingHorizontal={16}
                borderWidth={1}
                borderColor="#f5f5f4"
              >
                {recentTransactions.length > 0 ? (
                  recentTransactions.map(renderTransactionItem)
                ) : (
                  <Stack paddingVertical={32} alignItems="center">
                    <Text fontSize={14} color="#a8a29e">
                      최근 거래 내역이 없습니다
                    </Text>
                  </Stack>
                )}
              </Stack>
            </Stack>
          </Stack>
        }
      />
    </Screen>
  )
}
