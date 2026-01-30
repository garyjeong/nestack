import React, { useCallback } from 'react'
import { FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native'
import { Stack, Text } from 'tamagui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Screen } from '../../shared/components/layout/Screen'
import { useTheme } from '../../shared/hooks/useTheme'
import { useAccount, useAccountTransactions, useAccountMutations } from '../../features/finance/hooks'
import { formatCurrency, formatCompactCurrency, formatDate } from '../../shared/utils/format'
import type { Transaction } from '../../features/finance/types'
import type { FinanceStackParamList } from '../../app/navigation/types'
import {
  ArrowLeft,
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
} from 'lucide-react-native'

type Props = NativeStackScreenProps<FinanceStackParamList, 'AccountDetail'>

export default function AccountDetailScreen({ navigation, route }: Props) {
  const { colors } = useTheme()
  const { id } = route.params

  const {
    data: account,
    isLoading: isAccountLoading,
    refetch: refetchAccount,
  } = useAccount(id)

  const {
    transactions,
    isLoading: isTransactionsLoading,
    refetch: refetchTransactions,
  } = useAccountTransactions(id)

  const { syncAccount, isSyncing } = useAccountMutations()
  const isRefreshing = isAccountLoading || isTransactionsLoading

  const onRefresh = useCallback(() => {
    refetchAccount()
    refetchTransactions()
  }, [refetchAccount, refetchTransactions])

  if (isAccountLoading || !account) {
    return (
      <Screen edges={['top']}>
        <Stack flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color={colors.primary} />
        </Stack>
      </Screen>
    )
  }

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isDeposit = item.transactionType === 'deposit'
    return (
      <Stack
        flexDirection="row"
        alignItems="center"
        paddingVertical={14}
        paddingHorizontal={20}
        borderBottomWidth={1}
        borderBottomColor={colors.border}
      >
        <Stack
          width={40}
          height={40}
          borderRadius={4}
          backgroundColor={isDeposit ? `${colors.success}15` : `${colors.error}15`}
          alignItems="center"
          justifyContent="center"
        >
          {isDeposit ? (
            <ArrowDownLeft size={18} color={colors.success} />
          ) : (
            <ArrowUpRight size={18} color={colors.error} />
          )}
        </Stack>

        <Stack flex={1} marginLeft={12}>
          <Text fontSize={14} fontWeight="500" color={colors.text} numberOfLines={1}>
            {item.description}
          </Text>
          <Text fontSize={12} color={colors.textTertiary} marginTop={2}>
            {formatDate(item.transactionDate)}
          </Text>
        </Stack>

        <Stack alignItems="flex-end">
          <Text
            fontSize={14}
            fontWeight="600"
            color={isDeposit ? colors.success : colors.error}
          >
            {isDeposit ? '+' : '-'}{formatCurrency(item.amount)}
          </Text>
          <Text fontSize={11} color={colors.textTertiary} marginTop={2}>
            잔액 {formatCompactCurrency(item.balance)}
          </Text>
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
        justifyContent="space-between"
        paddingHorizontal={16}
        paddingVertical={12}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Text fontSize={18} fontWeight="700" color={colors.text}>
          계좌 상세
        </Text>
        <Pressable onPress={() => syncAccount({ id })}>
          <RefreshCw
            size={22}
            color={colors.primary}
            style={isSyncing ? { opacity: 0.5 } : undefined}
          />
        </Pressable>
      </Stack>

      {/* Account Info Card */}
      <Stack paddingHorizontal={20} marginBottom={16}>
        <Stack
          backgroundColor={colors.card}
          borderRadius={4}
          padding={20}
          borderWidth={1}
          borderColor={colors.border}
        >
          <Stack flexDirection="row" alignItems="center" gap={12}>
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
            <Stack flex={1}>
              <Text fontSize={16} fontWeight="700" color={colors.text}>
                {account.accountAlias ?? account.bankName}
              </Text>
              <Text fontSize={13} color={colors.textSecondary} marginTop={2}>
                {account.bankName} {account.accountNumber}
              </Text>
            </Stack>
          </Stack>

          <Stack marginTop={16}>
            <Text fontSize={12} color={colors.textTertiary}>
              잔액
            </Text>
            <Text fontSize={28} fontWeight="800" color={colors.text} marginTop={4}>
              {formatCurrency(account.balance)}
            </Text>
          </Stack>

          {account.lastSyncedAt && (
            <Text fontSize={11} color={colors.textTertiary} marginTop={8}>
              마지막 동기화: {formatDate(account.lastSyncedAt)}
            </Text>
          )}
        </Stack>
      </Stack>

      {/* Transaction List */}
      <Stack
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        paddingHorizontal={20}
        marginBottom={8}
      >
        <Text fontSize={17} fontWeight="700" color={colors.text}>
          거래 내역
        </Text>
        <Text fontSize={12} color={colors.textTertiary}>
          {transactions.length}건
        </Text>
      </Stack>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <Stack paddingVertical={40} alignItems="center">
            <Text fontSize={14} color={colors.textTertiary}>
              거래 내역이 없습니다
            </Text>
          </Stack>
        }
      />
    </Screen>
  )
}
