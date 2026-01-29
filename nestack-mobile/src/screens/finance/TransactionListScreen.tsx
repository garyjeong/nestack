import React, { useState, useCallback } from 'react'
import { FlatList, Pressable, RefreshControl } from 'react-native'
import { Stack, Text } from 'tamagui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Screen } from '../../shared/components/layout/Screen'
import { useTransactions } from '../../features/finance/hooks'
import { formatCurrency, formatDate } from '../../shared/utils/format'
import type { Transaction } from '../../features/finance/types'
import type { FinanceStackParamList } from '../../app/navigation/types'
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
} from 'lucide-react-native'

type Props = NativeStackScreenProps<FinanceStackParamList, 'TransactionList'>

type TransactionTypeFilter = 'all' | 'deposit' | 'withdraw'

const TYPE_TABS: { key: TransactionTypeFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'deposit', label: '입금' },
  { key: 'withdraw', label: '출금' },
]

export default function TransactionListScreen({ navigation, route }: Props) {
  const accountId = route.params?.accountId
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>('all')

  const {
    transactions,
    isLoading,
    refetch,
  } = useTransactions({
    accountId,
    type: typeFilter === 'all' ? undefined : typeFilter,
  })

  const onRefresh = useCallback(() => {
    refetch()
  }, [refetch])

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
        backgroundColor="#ffffff"
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
          <Stack flexDirection="row" alignItems="center" gap={6} marginTop={2}>
            <Text fontSize={12} color="#a8a29e">
              {formatDate(item.transactionDate)}
            </Text>
            {item.mission && (
              <Stack
                paddingHorizontal={6}
                paddingVertical={1}
                borderRadius={4}
                backgroundColor="#ecfdf5"
              >
                <Text fontSize={10} color="#059669" fontWeight="500">
                  {item.mission.name}
                </Text>
              </Stack>
            )}
          </Stack>
        </Stack>

        <Text
          fontSize={14}
          fontWeight="600"
          color={isDeposit ? '#059669' : '#ef4444'}
        >
          {isDeposit ? '+' : '-'}{formatCurrency(item.amount)}
        </Text>
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
        <Text fontSize={18} fontWeight="700" color="#1c1917" marginLeft={12} flex={1}>
          거래 내역
        </Text>
      </Stack>

      {/* Type Filter Tabs */}
      <Stack
        flexDirection="row"
        paddingHorizontal={20}
        paddingVertical={8}
        gap={4}
      >
        {TYPE_TABS.map((tab) => {
          const isActive = typeFilter === tab.key
          return (
            <Pressable key={tab.key} onPress={() => setTypeFilter(tab.key)}>
              <Stack
                paddingHorizontal={16}
                paddingVertical={8}
                borderRadius={8}
                backgroundColor={isActive ? '#059669' : 'transparent'}
              >
                <Text
                  fontSize={14}
                  fontWeight={isActive ? '600' : '400'}
                  color={isActive ? '#ffffff' : '#78716c'}
                >
                  {tab.label}
                </Text>
              </Stack>
            </Pressable>
          )
        })}
      </Stack>

      {/* Transaction List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#059669" />
        }
        ListEmptyComponent={
          <Stack paddingVertical={60} alignItems="center">
            <Stack
              width={56}
              height={56}
              borderRadius={28}
              backgroundColor="#f5f5f4"
              alignItems="center"
              justifyContent="center"
              marginBottom={12}
            >
              <Filter size={24} color="#a8a29e" />
            </Stack>
            <Text fontSize={14} color="#78716c">
              거래 내역이 없습니다
            </Text>
          </Stack>
        }
      />
    </Screen>
  )
}
