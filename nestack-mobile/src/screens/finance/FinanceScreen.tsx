import React, { useCallback } from 'react'
import { ScrollView, Pressable, RefreshControl, StyleSheet } from 'react-native'
import { Stack, Text } from 'tamagui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import LinearGradient from 'react-native-linear-gradient'
import { Screen } from '../../shared/components/layout/Screen'
import { Card } from '../../shared/components/ui/Card'
import { Button } from '../../shared/components/ui/Button'
import { ProgressBar } from '../../shared/components/ui/ProgressBar'
import { useTheme } from '../../shared/hooks/useTheme'
import { useFinanceSummary, useAccounts, useOpenBankingConnection } from '../../features/finance/hooks'
import { formatCurrency, formatCompactCurrency } from '../../shared/utils/format'
import type { BankAccount } from '../../features/finance/types'
import type { FinanceStackParamList } from '../../app/navigation/types'
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  Landmark,
  ChevronRight,
  Link as LinkIcon,
  PiggyBank,
  Wallet,
} from 'lucide-react-native'

type Props = NativeStackScreenProps<FinanceStackParamList, 'Finance'>

export default function FinanceScreen({ navigation }: Props) {
  const { colors, palette } = useTheme()

  const {
    data: summary,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useFinanceSummary()

  const {
    accounts,
    isLoading: isAccountsLoading,
    refetch: refetchAccounts,
  } = useAccounts()

  const { getAuthUrl, isConnecting } = useOpenBankingConnection()

  const isRefreshing = isSummaryLoading || isAccountsLoading

  const onRefresh = useCallback(() => {
    refetchSummary()
    refetchAccounts()
  }, [refetchSummary, refetchAccounts])

  const savingsRate = summary?.savingsRate ?? 0

  return (
    <Screen edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)}>
          <Stack
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            paddingHorizontal={20}
            paddingTop={16}
            paddingBottom={8}
          >
            <Text fontSize={26} fontWeight="800" color={colors.text}>
              금융
            </Text>
            <Pressable onPress={() => navigation.navigate('TransactionList', {})}>
              <Stack flexDirection="row" alignItems="center">
                <Text fontSize={14} fontWeight="600" color={colors.primary}>
                  전체 거래
                </Text>
                <ChevronRight size={18} color={colors.primary} />
              </Stack>
            </Pressable>
          </Stack>
        </Animated.View>

        {/* Total Balance Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Stack paddingHorizontal={20} marginTop={8}>
            <Stack borderRadius={24} overflow="hidden">
              <LinearGradient
                colors={[...palette.gradient]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.balanceCard}
              >
                <Stack flexDirection="row" alignItems="center" gap={10}>
                  <Stack
                    width={40}
                    height={40}
                    borderRadius={12}
                    backgroundColor="rgba(255,255,255,0.2)"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Wallet size={22} color="#ffffff" />
                  </Stack>
                  <Text fontSize={14} color="rgba(255,255,255,0.8)" fontWeight="500">
                    총 자산
                  </Text>
                </Stack>
                <Text fontSize={36} fontWeight="800" color="#ffffff" marginTop={12}>
                  {formatCurrency(summary?.totalBalance ?? 0)}
                </Text>
              </LinearGradient>
            </Stack>
          </Stack>
        </Animated.View>

        {/* Monthly Summary */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Stack flexDirection="row" paddingHorizontal={20} gap={10} marginTop={16}>
            {/* Income */}
            <Card variant="default" style={{ flex: 1 }}>
              <Stack padding={16}>
                <Stack flexDirection="row" alignItems="center" gap={10} marginBottom={12}>
                  <Stack
                    width={36}
                    height={36}
                    borderRadius={10}
                    backgroundColor={`${colors.success}15`}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <TrendingUp size={18} color={colors.success} />
                  </Stack>
                  <Text fontSize={13} color={colors.textSecondary} fontWeight="500">
                    이번 달 수입
                  </Text>
                </Stack>
                <Text fontSize={20} fontWeight="800" color={colors.success}>
                  +{formatCompactCurrency(summary?.monthlyIncome ?? 0)}
                </Text>
              </Stack>
            </Card>

            {/* Expense */}
            <Card variant="default" style={{ flex: 1 }}>
              <Stack padding={16}>
                <Stack flexDirection="row" alignItems="center" gap={10} marginBottom={12}>
                  <Stack
                    width={36}
                    height={36}
                    borderRadius={10}
                    backgroundColor={`${colors.error}15`}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <TrendingDown size={18} color={colors.error} />
                  </Stack>
                  <Text fontSize={13} color={colors.textSecondary} fontWeight="500">
                    이번 달 지출
                  </Text>
                </Stack>
                <Text fontSize={20} fontWeight="800" color={colors.error}>
                  -{formatCompactCurrency(summary?.monthlyExpense ?? 0)}
                </Text>
              </Stack>
            </Card>
          </Stack>
        </Animated.View>

        {/* Savings Rate */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Stack paddingHorizontal={20} marginTop={12}>
            <Card variant="default">
              <Stack padding={18}>
                <Stack flexDirection="row" alignItems="center" justifyContent="space-between" marginBottom={14}>
                  <Stack flexDirection="row" alignItems="center" gap={10}>
                    <Stack
                      width={36}
                      height={36}
                      borderRadius={10}
                      backgroundColor={`${colors.primary}15`}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <PiggyBank size={18} color={colors.primary} />
                    </Stack>
                    <Text fontSize={14} fontWeight="600" color={colors.text}>
                      이번 달 저축률
                    </Text>
                  </Stack>
                  <Text fontSize={22} fontWeight="800" color={colors.primary}>
                    {Math.round(savingsRate)}%
                  </Text>
                </Stack>
                <ProgressBar
                  progress={savingsRate}
                  height={10}
                  variant={savingsRate >= 30 ? 'success' : savingsRate >= 15 ? 'warning' : 'error'}
                />
                <Text fontSize={12} color={colors.textTertiary} marginTop={10}>
                  {savingsRate >= 30
                    ? '훌륭해요! 목표 저축률을 달성했습니다'
                    : savingsRate >= 15
                      ? '좋아요! 조금만 더 저축해보세요'
                      : '저축률을 높여보세요'}
                </Text>
              </Stack>
            </Card>
          </Stack>
        </Animated.View>

        {/* Connected Accounts */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Stack paddingHorizontal={20} marginTop={28}>
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              marginBottom={14}
            >
              <Text fontSize={18} fontWeight="700" color={colors.text}>
                연결 계좌
              </Text>
              <Stack
                paddingHorizontal={10}
                paddingVertical={4}
                borderRadius={8}
                backgroundColor={`${colors.primary}15`}
              >
                <Text fontSize={12} fontWeight="700" color={colors.primary}>
                  {accounts.length}개
                </Text>
              </Stack>
            </Stack>

            {accounts.length > 0 ? (
              <Stack gap={10}>
                {accounts.map((account: BankAccount, index: number) => (
                  <Animated.View
                    key={account.id}
                    entering={FadeInDown.delay(450 + index * 50).duration(400)}
                  >
                    <Pressable
                      onPress={() =>
                        navigation.navigate('AccountDetail', { id: account.id })
                      }
                    >
                      <Card variant="elevated">
                        <Stack
                          padding={16}
                          flexDirection="row"
                          alignItems="center"
                        >
                          <Stack
                            width={48}
                            height={48}
                            borderRadius={4}
                            backgroundColor={`${colors.info}15`}
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Landmark size={24} color={colors.info} />
                          </Stack>
                          <Stack flex={1} marginLeft={14}>
                            <Text fontSize={15} fontWeight="600" color={colors.text}>
                              {account.accountAlias ?? account.bankName}
                            </Text>
                            <Text fontSize={12} color={colors.textTertiary} marginTop={3}>
                              {account.bankName} {account.accountNumber}
                            </Text>
                          </Stack>
                          <Stack alignItems="flex-end">
                            <Text fontSize={16} fontWeight="800" color={colors.text}>
                              {formatCompactCurrency(account.balance)}
                            </Text>
                            <ChevronRight size={18} color={colors.border} style={{ marginTop: 4 }} />
                          </Stack>
                        </Stack>
                      </Card>
                    </Pressable>
                  </Animated.View>
                ))}
              </Stack>
            ) : (
              <Card variant="default">
                <Stack padding={32} alignItems="center">
                  <Stack
                    width={64}
                    height={64}
                    borderRadius={20}
                    backgroundColor={`${colors.primary}10`}
                    alignItems="center"
                    justifyContent="center"
                    marginBottom={16}
                  >
                    <CreditCard size={28} color={colors.primary} />
                  </Stack>
                  <Text fontSize={16} fontWeight="600" color={colors.text} textAlign="center">
                    연결된 계좌가 없습니다
                  </Text>
                  <Text fontSize={13} color={colors.textSecondary} textAlign="center" marginTop={6}>
                    오픈뱅킹으로 계좌를 연결해보세요
                  </Text>
                </Stack>
              </Card>
            )}
          </Stack>
        </Animated.View>

        {/* Open Banking Connection */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <Stack paddingHorizontal={20} marginTop={20}>
            <Button
              onPress={() => getAuthUrl()}
              isLoading={isConnecting}
              variant="outline"
              fullWidth
              size="lg"
              leftIcon={<LinkIcon size={18} color={colors.primary} />}
            >
              오픈뱅킹 계좌 연결
            </Button>
          </Stack>
        </Animated.View>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  balanceCard: {
    padding: 24,
  },
})
