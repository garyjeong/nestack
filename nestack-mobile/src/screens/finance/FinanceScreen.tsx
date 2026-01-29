import React, { useCallback } from 'react'
import { ScrollView, Pressable, RefreshControl } from 'react-native'
import { Stack, Text } from 'tamagui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Screen } from '../../shared/components/layout/Screen'
import { Button } from '../../shared/components/ui/Button'
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
  RefreshCw,
} from 'lucide-react-native'

type Props = NativeStackScreenProps<FinanceStackParamList, 'Finance'>

export default function FinanceScreen({ navigation }: Props) {
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

  return (
    <Screen edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#059669" />
        }
      >
        {/* Header */}
        <Stack
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal={20}
          paddingTop={16}
          paddingBottom={8}
        >
          <Text fontSize={24} fontWeight="800" color="#1c1917">
            가계부
          </Text>
          <Pressable onPress={() => navigation.navigate('TransactionList', {})}>
            <Text fontSize={14} fontWeight="500" color="#059669">
              전체 거래
            </Text>
          </Pressable>
        </Stack>

        {/* Total Balance Card */}
        <Stack paddingHorizontal={20} marginTop={8}>
          <Stack
            backgroundColor="#059669"
            borderRadius={20}
            padding={24}
          >
            <Text fontSize={13} color="#a7f3d0" fontWeight="500">
              총 자산
            </Text>
            <Text fontSize={32} fontWeight="800" color="#ffffff" marginTop={8}>
              {formatCurrency(summary?.totalBalance ?? 0)}
            </Text>
          </Stack>
        </Stack>

        {/* Monthly Summary */}
        <Stack flexDirection="row" paddingHorizontal={20} gap={12} marginTop={16}>
          {/* Income */}
          <Stack
            flex={1}
            backgroundColor="#ffffff"
            borderRadius={14}
            padding={16}
            borderWidth={1}
            borderColor="#f5f5f4"
          >
            <Stack flexDirection="row" alignItems="center" gap={8} marginBottom={8}>
              <Stack
                width={32}
                height={32}
                borderRadius={8}
                backgroundColor="#ecfdf5"
                alignItems="center"
                justifyContent="center"
              >
                <TrendingUp size={16} color="#059669" />
              </Stack>
              <Text fontSize={12} color="#78716c">
                이번 달 수입
              </Text>
            </Stack>
            <Text fontSize={18} fontWeight="700" color="#059669">
              {formatCompactCurrency(summary?.monthlyIncome ?? 0)}
            </Text>
          </Stack>

          {/* Expense */}
          <Stack
            flex={1}
            backgroundColor="#ffffff"
            borderRadius={14}
            padding={16}
            borderWidth={1}
            borderColor="#f5f5f4"
          >
            <Stack flexDirection="row" alignItems="center" gap={8} marginBottom={8}>
              <Stack
                width={32}
                height={32}
                borderRadius={8}
                backgroundColor="#fff1f2"
                alignItems="center"
                justifyContent="center"
              >
                <TrendingDown size={16} color="#ef4444" />
              </Stack>
              <Text fontSize={12} color="#78716c">
                이번 달 지출
              </Text>
            </Stack>
            <Text fontSize={18} fontWeight="700" color="#ef4444">
              {formatCompactCurrency(summary?.monthlyExpense ?? 0)}
            </Text>
          </Stack>
        </Stack>

        {/* Savings Rate */}
        <Stack paddingHorizontal={20} marginTop={12}>
          <Stack
            backgroundColor="#ffffff"
            borderRadius={14}
            padding={16}
            borderWidth={1}
            borderColor="#f5f5f4"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Text fontSize={14} color="#78716c">
              저축률
            </Text>
            <Text fontSize={18} fontWeight="700" color="#059669">
              {Math.round(summary?.savingsRate ?? 0)}%
            </Text>
          </Stack>
        </Stack>

        {/* Connected Accounts */}
        <Stack paddingHorizontal={20} marginTop={24}>
          <Stack
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            marginBottom={12}
          >
            <Text fontSize={17} fontWeight="700" color="#1c1917">
              연결 계좌
            </Text>
            <Text fontSize={12} color="#a8a29e">
              {accounts.length}개
            </Text>
          </Stack>

          {accounts.length > 0 ? (
            <Stack gap={8}>
              {accounts.map((account: BankAccount) => (
                <Pressable
                  key={account.id}
                  onPress={() =>
                    navigation.navigate('AccountDetail', { id: account.id })
                  }
                >
                  <Stack
                    backgroundColor="#ffffff"
                    borderRadius={14}
                    padding={16}
                    borderWidth={1}
                    borderColor="#f5f5f4"
                    flexDirection="row"
                    alignItems="center"
                  >
                    <Stack
                      width={44}
                      height={44}
                      borderRadius={12}
                      backgroundColor="#eff6ff"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Landmark size={22} color="#3b82f6" />
                    </Stack>
                    <Stack flex={1} marginLeft={12}>
                      <Text fontSize={14} fontWeight="600" color="#1c1917">
                        {account.accountAlias ?? account.bankName}
                      </Text>
                      <Text fontSize={12} color="#a8a29e" marginTop={2}>
                        {account.bankName} {account.accountNumber}
                      </Text>
                    </Stack>
                    <Stack alignItems="flex-end">
                      <Text fontSize={15} fontWeight="700" color="#1c1917">
                        {formatCompactCurrency(account.balance)}
                      </Text>
                      <ChevronRight size={16} color="#d6d3d1" />
                    </Stack>
                  </Stack>
                </Pressable>
              ))}
            </Stack>
          ) : (
            <Stack
              backgroundColor="#ffffff"
              borderRadius={14}
              padding={24}
              alignItems="center"
              borderWidth={1}
              borderColor="#f5f5f4"
            >
              <Stack
                width={56}
                height={56}
                borderRadius={28}
                backgroundColor="#f5f5f4"
                alignItems="center"
                justifyContent="center"
                marginBottom={12}
              >
                <CreditCard size={24} color="#a8a29e" />
              </Stack>
              <Text fontSize={14} color="#78716c" textAlign="center">
                연결된 계좌가 없습니다
              </Text>
              <Text fontSize={12} color="#a8a29e" textAlign="center" marginTop={4}>
                오픈뱅킹으로 계좌를 연결해보세요
              </Text>
            </Stack>
          )}
        </Stack>

        {/* Open Banking Connection */}
        <Stack paddingHorizontal={20} marginTop={24}>
          <Button
            onPress={() => getAuthUrl()}
            isLoading={isConnecting}
            variant="outline"
            fullWidth
            size="lg"
          >
            <Stack flexDirection="row" alignItems="center" gap={8}>
              <LinkIcon size={18} color="#059669" />
              <Text fontSize={15} fontWeight="600" color="#059669">
                오픈뱅킹 계좌 연결
              </Text>
            </Stack>
          </Button>
        </Stack>
      </ScrollView>
    </Screen>
  )
}
