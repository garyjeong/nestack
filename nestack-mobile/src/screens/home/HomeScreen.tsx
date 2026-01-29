import React, { useCallback } from 'react'
import { FlatList, Pressable, RefreshControl, StyleSheet } from 'react-native'
import { Stack, Text } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated'
import LinearGradient from 'react-native-linear-gradient'
import { Screen } from '../../shared/components/layout/Screen'
import { Card } from '../../shared/components/ui/Card'
import { CompactProgressBar } from '../../shared/components/ui/ProgressBar'
import { useTheme } from '../../shared/hooks/useTheme'
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
  Bell,
  Users,
} from 'lucide-react-native'

export default function HomeScreen() {
  const { colors, palette, isDark } = useTheme()
  const user = useAuthStore((state) => state.user)
  const partner = useAuthStore((state) => state.partner)
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

  const renderMissionCard = ({ item, index }: { item: Mission; index: number }) => (
    <Animated.View entering={FadeInRight.delay(index * 100).duration(400)}>
      <Pressable
        onPress={() =>
          navigation.navigate('MissionDetail' as any, { id: item.id })
        }
      >
        <Card
          variant="elevated"
          style={{ width: 200, marginRight: 12 }}
        >
          <Stack padding={16}>
            <Stack
              width={44}
              height={44}
              borderRadius={14}
              backgroundColor={`${colors.primary}15`}
              alignItems="center"
              justifyContent="center"
              marginBottom={14}
            >
              <Target size={22} color={colors.primary} />
            </Stack>
            <Text
              fontSize={15}
              fontWeight="600"
              color={colors.text}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text fontSize={13} color={colors.textSecondary} marginTop={4}>
              {formatCompactCurrency(item.currentAmount)} /{' '}
              {formatCompactCurrency(item.targetAmount)}
            </Text>

            <Stack marginTop={14}>
              <CompactProgressBar progress={item.progress} />
            </Stack>
            <Stack flexDirection="row" justifyContent="space-between" marginTop={8}>
              <Text fontSize={12} fontWeight="600" color={colors.primary}>
                {Math.round(item.progress)}%
              </Text>
              <Text fontSize={12} color={colors.textTertiary}>
                D-{item.daysRemaining}
              </Text>
            </Stack>
          </Stack>
        </Card>
      </Pressable>
    </Animated.View>
  )

  const renderTransactionItem = (transaction: Transaction) => {
    const isDeposit = transaction.transactionType === 'deposit'
    return (
      <Stack
        key={transaction.id}
        flexDirection="row"
        alignItems="center"
        paddingVertical={14}
        borderBottomWidth={1}
        borderBottomColor={colors.border}
      >
        <Stack
          width={42}
          height={42}
          borderRadius={14}
          backgroundColor={isDeposit ? `${colors.success}15` : `${colors.error}15`}
          alignItems="center"
          justifyContent="center"
        >
          {isDeposit ? (
            <ArrowDownLeft size={20} color={colors.success} />
          ) : (
            <ArrowUpRight size={20} color={colors.error} />
          )}
        </Stack>

        <Stack flex={1} marginLeft={14}>
          <Text fontSize={15} fontWeight="500" color={colors.text} numberOfLines={1}>
            {transaction.description}
          </Text>
          <Text fontSize={12} color={colors.textTertiary} marginTop={2}>
            {formatRelativeDate(transaction.transactionDate)}
          </Text>
        </Stack>

        <Text
          fontSize={15}
          fontWeight="700"
          color={isDeposit ? colors.success : colors.error}
        >
          {isDeposit ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </Text>
      </Stack>
    )
  }

  const progress = missionSummary?.monthlyProgress ?? 0

  return (
    <Screen edges={['top']}>
      <FlatList
        data={[]}
        renderItem={null}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <Stack>
            {/* Couple Profile Header */}
            <Animated.View entering={FadeIn.duration(500)}>
              <Stack
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                paddingHorizontal={20}
                paddingTop={16}
                paddingBottom={12}
              >
                <Stack flexDirection="row" alignItems="center" gap={12}>
                  {/* User Avatar */}
                  <Stack
                    width={46}
                    height={46}
                    borderRadius={23}
                    backgroundColor={`${colors.primary}20`}
                    alignItems="center"
                    justifyContent="center"
                    borderWidth={2}
                    borderColor={colors.primary}
                  >
                    <Text fontSize={18} fontWeight="700" color={colors.primary}>
                      {user?.name?.charAt(0) ?? 'N'}
                    </Text>
                  </Stack>

                  {/* Partner Avatar */}
                  {partner ? (
                    <Stack
                      width={46}
                      height={46}
                      borderRadius={23}
                      backgroundColor={`${palette.secondary}20`}
                      alignItems="center"
                      justifyContent="center"
                      borderWidth={2}
                      borderColor={palette.secondary}
                      marginLeft={-16}
                    >
                      <Text fontSize={18} fontWeight="700" color={palette.secondary}>
                        {partner?.name?.charAt(0) ?? 'P'}
                      </Text>
                    </Stack>
                  ) : (
                    <Stack
                      width={46}
                      height={46}
                      borderRadius={23}
                      backgroundColor={colors.border}
                      alignItems="center"
                      justifyContent="center"
                      borderWidth={2}
                      borderColor={colors.border}
                      marginLeft={-16}
                    >
                      <Users size={20} color={colors.textTertiary} />
                    </Stack>
                  )}

                  <Stack marginLeft={4}>
                    <Text fontSize={16} fontWeight="700" color={colors.text}>
                      우리의 저축 여정
                    </Text>
                    <Text fontSize={12} color={colors.textSecondary} marginTop={2}>
                      {user?.name ?? '사용자'}{partner ? ` & ${partner.name}` : ''}
                    </Text>
                  </Stack>
                </Stack>

                {/* Notification */}
                <Pressable>
                  <Stack
                    width={44}
                    height={44}
                    borderRadius={14}
                    backgroundColor={colors.card}
                    alignItems="center"
                    justifyContent="center"
                    borderWidth={1}
                    borderColor={colors.border}
                  >
                    <Bell size={22} color={colors.textSecondary} />
                  </Stack>
                </Pressable>
              </Stack>
            </Animated.View>

            {/* Main Savings Card with Gradient */}
            <Animated.View entering={FadeInDown.delay(100).duration(500)}>
              <Stack paddingHorizontal={20} marginTop={12}>
                <Stack borderRadius={24} overflow="hidden">
                  <LinearGradient
                    colors={[...palette.gradient]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientCard}
                  >
                    <Text fontSize={14} color="rgba(255,255,255,0.8)" fontWeight="500">
                      이번 달 저축 현황
                    </Text>
                    <Text
                      fontSize={36}
                      fontWeight="800"
                      color="#ffffff"
                      marginTop={8}
                    >
                      {formatCurrency(missionSummary?.totalSavedAmount ?? 0)}
                    </Text>

                    {/* Progress Bar */}
                    <Stack marginTop={20}>
                      <Stack
                        height={8}
                        borderRadius={4}
                        backgroundColor="rgba(255,255,255,0.3)"
                        overflow="hidden"
                      >
                        <Stack
                          height={8}
                          borderRadius={4}
                          backgroundColor="#ffffff"
                          width={`${Math.min(progress, 100)}%`}
                        />
                      </Stack>
                      <Stack flexDirection="row" justifyContent="space-between" marginTop={10}>
                        <Text fontSize={13} color="rgba(255,255,255,0.8)">
                          목표: {formatCompactCurrency(missionSummary?.monthlyTarget ?? 0)}
                        </Text>
                        <Text fontSize={14} fontWeight="700" color="#ffffff">
                          {Math.round(progress)}%
                        </Text>
                      </Stack>
                    </Stack>
                  </LinearGradient>
                </Stack>
              </Stack>
            </Animated.View>

            {/* Quick Stats */}
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <Stack
                flexDirection="row"
                paddingHorizontal={20}
                gap={10}
                marginTop={20}
              >
                <Card variant="default" style={{ flex: 1 }}>
                  <Stack padding={14} alignItems="center">
                    <Stack
                      width={40}
                      height={40}
                      borderRadius={12}
                      backgroundColor={`${colors.primary}15`}
                      alignItems="center"
                      justifyContent="center"
                      marginBottom={10}
                    >
                      <Target size={20} color={colors.primary} />
                    </Stack>
                    <Text fontSize={22} fontWeight="800" color={colors.text}>
                      {missionSummary?.activeMissions ?? 0}
                    </Text>
                    <Text fontSize={11} color={colors.textSecondary} marginTop={2}>
                      진행 중
                    </Text>
                  </Stack>
                </Card>

                <Card variant="default" style={{ flex: 1 }}>
                  <Stack padding={14} alignItems="center">
                    <Stack
                      width={40}
                      height={40}
                      borderRadius={12}
                      backgroundColor={`${colors.info}15`}
                      alignItems="center"
                      justifyContent="center"
                      marginBottom={10}
                    >
                      <CreditCard size={20} color={colors.info} />
                    </Stack>
                    <Text fontSize={22} fontWeight="800" color={colors.text}>
                      {financeSummary?.connectedAccounts ?? 0}
                    </Text>
                    <Text fontSize={11} color={colors.textSecondary} marginTop={2}>
                      연결 계좌
                    </Text>
                  </Stack>
                </Card>

                <Card variant="default" style={{ flex: 1 }}>
                  <Stack padding={14} alignItems="center">
                    <Stack
                      width={40}
                      height={40}
                      borderRadius={12}
                      backgroundColor={`${colors.warning}15`}
                      alignItems="center"
                      justifyContent="center"
                      marginBottom={10}
                    >
                      <TrendingUp size={20} color={colors.warning} />
                    </Stack>
                    <Text fontSize={22} fontWeight="800" color={colors.text}>
                      {missionSummary?.completedMissions ?? 0}
                    </Text>
                    <Text fontSize={11} color={colors.textSecondary} marginTop={2}>
                      완료
                    </Text>
                  </Stack>
                </Card>
              </Stack>
            </Animated.View>

            {/* Active Missions */}
            {activeMissions.length > 0 && (
              <Animated.View entering={FadeInDown.delay(300).duration(500)}>
                <Stack marginTop={28}>
                  <Stack
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    paddingHorizontal={20}
                    marginBottom={14}
                  >
                    <Text fontSize={18} fontWeight="700" color={colors.text}>
                      진행 중인 미션
                    </Text>
                    <Pressable
                      onPress={() =>
                        navigation.navigate('Missions' as any)
                      }
                    >
                      <Stack flexDirection="row" alignItems="center">
                        <Text fontSize={14} fontWeight="500" color={colors.primary}>
                          전체보기
                        </Text>
                        <ChevronRight size={18} color={colors.primary} />
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
              </Animated.View>
            )}

            {/* Recent Transactions */}
            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
              <Stack marginTop={28} paddingHorizontal={20}>
                <Stack
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  marginBottom={14}
                >
                  <Text fontSize={18} fontWeight="700" color={colors.text}>
                    최근 활동
                  </Text>
                  <Pressable
                    onPress={() =>
                      navigation.navigate('TransactionList' as any, {})
                    }
                  >
                    <Stack flexDirection="row" alignItems="center">
                      <Text fontSize={14} fontWeight="500" color={colors.primary}>
                        전체보기
                      </Text>
                      <ChevronRight size={18} color={colors.primary} />
                    </Stack>
                  </Pressable>
                </Stack>

                <Card variant="default">
                  <Stack paddingHorizontal={16}>
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map(renderTransactionItem)
                    ) : (
                      <Stack paddingVertical={40} alignItems="center">
                        <Text fontSize={14} color={colors.textTertiary}>
                          최근 활동 내역이 없습니다
                        </Text>
                      </Stack>
                    )}
                  </Stack>
                </Card>
              </Stack>
            </Animated.View>
          </Stack>
        }
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  gradientCard: {
    padding: 24,
  },
})
