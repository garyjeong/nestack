import React, { useCallback } from 'react'
import { FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native'
import { Stack, Text } from 'tamagui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Screen } from '../../shared/components/layout/Screen'
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
          <ActivityIndicator size="large" color="#059669" />
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
            {item.description}
          </Text>
          <Text fontSize={12} color="#a8a29e" marginTop={2}>
            {formatDate(item.transactionDate)}
          </Text>
        </Stack>

        <Stack alignItems="flex-end">
          <Text
            fontSize={14}
            fontWeight="600"
            color={isDeposit ? '#059669' : '#ef4444'}
          >
            {isDeposit ? '+' : '-'}{formatCurrency(item.amount)}
          </Text>
          <Text fontSize={11} color="#a8a29e" marginTop={2}>
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
          <ArrowLeft size={24} color="#1c1917" />
        </Pressable>
        <Text fontSize={18} fontWeight="700" color="#1c1917">
          계좌 상세
        </Text>
        <Pressable onPress={() => syncAccount({ id })}>
          <RefreshCw
            size={22}
            color="#059669"
            style={isSyncing ? { opacity: 0.5 } : undefined}
          />
        </Pressable>
      </Stack>

      {/* Account Info Card */}
      <Stack paddingHorizontal={20} marginBottom={16}>
        <Stack
          backgroundColor="#ffffff"
          borderRadius={16}
          padding={20}
          borderWidth={1}
          borderColor="#f5f5f4"
        >
          <Stack flexDirection="row" alignItems="center" gap={12}>
            <Stack
              width={48}
              height={48}
              borderRadius={14}
              backgroundColor="#eff6ff"
              alignItems="center"
              justifyContent="center"
            >
              <Landmark size={24} color="#3b82f6" />
            </Stack>
            <Stack flex={1}>
              <Text fontSize={16} fontWeight="700" color="#1c1917">
                {account.accountAlias ?? account.bankName}
              </Text>
              <Text fontSize={13} color="#78716c" marginTop={2}>
                {account.bankName} {account.accountNumber}
              </Text>
            </Stack>
          </Stack>

          <Stack marginTop={16}>
            <Text fontSize={12} color="#a8a29e">
              잔액
            </Text>
            <Text fontSize={28} fontWeight="800" color="#1c1917" marginTop={4}>
              {formatCurrency(account.balance)}
            </Text>
          </Stack>

          {account.lastSyncedAt && (
            <Text fontSize={11} color="#a8a29e" marginTop={8}>
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
        <Text fontSize={17} fontWeight="700" color="#1c1917">
          거래 내역
        </Text>
        <Text fontSize={12} color="#a8a29e">
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
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#059669" />
        }
        ListEmptyComponent={
          <Stack paddingVertical={40} alignItems="center">
            <Text fontSize={14} color="#a8a29e">
              거래 내역이 없습니다
            </Text>
          </Stack>
        }
      />
    </Screen>
  )
}
