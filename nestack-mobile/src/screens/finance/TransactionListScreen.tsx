import React, { useState, useCallback, useMemo } from 'react'
import { FlatList, Pressable, RefreshControl, SectionList } from 'react-native'
import { Stack, Text } from 'tamagui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import { Screen } from '../../shared/components/layout/Screen'
import { Card } from '../../shared/components/ui/Card'
import { useTheme } from '../../shared/hooks/useTheme'
import { useTransactions } from '../../features/finance/hooks'
import { formatCurrency, formatDate } from '../../shared/utils/format'
import type { Transaction } from '../../features/finance/types'
import type { FinanceStackParamList } from '../../app/navigation/types'
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Coffee,
  ShoppingBag,
  Car,
  Home,
  Utensils,
  Plane,
  Gift,
  Wallet,
} from 'lucide-react-native'

type Props = NativeStackScreenProps<FinanceStackParamList, 'TransactionList'>

type TransactionTypeFilter = 'all' | 'deposit' | 'withdraw'

const TYPE_TABS: { key: TransactionTypeFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'deposit', label: '입금' },
  { key: 'withdraw', label: '출금' },
]

// Category icon mapping
const getCategoryIcon = (category: string | undefined, color: string) => {
  const iconProps = { size: 20, color }
  switch (category?.toLowerCase()) {
    case 'food':
    case '식비':
      return <Utensils {...iconProps} />
    case 'cafe':
    case '카페':
      return <Coffee {...iconProps} />
    case 'shopping':
    case '쇼핑':
      return <ShoppingBag {...iconProps} />
    case 'transport':
    case '교통':
      return <Car {...iconProps} />
    case 'housing':
    case '주거':
      return <Home {...iconProps} />
    case 'travel':
    case '여행':
      return <Plane {...iconProps} />
    case 'gift':
    case '선물':
      return <Gift {...iconProps} />
    default:
      return <Wallet {...iconProps} />
  }
}

export default function TransactionListScreen({ navigation, route }: Props) {
  const { colors } = useTheme()
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

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {}

    transactions.forEach((transaction) => {
      const date = formatDate(transaction.transactionDate)
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(transaction)
    })

    return Object.entries(groups).map(([title, data]) => ({
      title,
      data,
    }))
  }, [transactions])

  const renderTransaction = ({ item, index }: { item: Transaction; index: number }) => {
    const isDeposit = item.transactionType === 'deposit'
    const iconColor = isDeposit ? colors.success : colors.error
    const bgColor = isDeposit ? `${colors.success}15` : `${colors.error}15`

    return (
      <Animated.View entering={FadeInDown.delay(index * 30).duration(300)}>
        <Stack
          flexDirection="row"
          alignItems="center"
          paddingVertical={14}
          paddingHorizontal={20}
          backgroundColor={colors.background}
        >
          <Stack
            width={44}
            height={44}
            borderRadius={14}
            backgroundColor={bgColor}
            alignItems="center"
            justifyContent="center"
          >
            {isDeposit ? (
              <ArrowDownLeft size={22} color={iconColor} />
            ) : (
              getCategoryIcon(item.category, iconColor)
            )}
          </Stack>

          <Stack flex={1} marginLeft={14}>
            <Text fontSize={15} fontWeight="600" color={colors.text} numberOfLines={1}>
              {item.description}
            </Text>
            <Stack flexDirection="row" alignItems="center" gap={8} marginTop={4}>
              {item.category && (
                <Text fontSize={12} color={colors.textTertiary}>
                  {item.category}
                </Text>
              )}
              {item.mission && (
                <Stack
                  paddingHorizontal={8}
                  paddingVertical={2}
                  borderRadius={6}
                  backgroundColor={`${colors.primary}15`}
                >
                  <Text fontSize={10} color={colors.primary} fontWeight="600">
                    {item.mission.name}
                  </Text>
                </Stack>
              )}
            </Stack>
          </Stack>

          <Text
            fontSize={16}
            fontWeight="700"
            color={isDeposit ? colors.success : colors.error}
          >
            {isDeposit ? '+' : '-'}{formatCurrency(item.amount)}
          </Text>
        </Stack>
      </Animated.View>
    )
  }

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <Stack
      paddingHorizontal={20}
      paddingVertical={10}
      backgroundColor={colors.backgroundSecondary}
    >
      <Text fontSize={13} fontWeight="600" color={colors.textSecondary}>
        {section.title}
      </Text>
    </Stack>
  )

  return (
    <Screen edges={['top']}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)}>
        <Stack
          flexDirection="row"
          alignItems="center"
          paddingHorizontal={16}
          paddingVertical={14}
        >
          <Pressable onPress={() => navigation.goBack()}>
            <Stack
              width={40}
              height={40}
              borderRadius={12}
              backgroundColor={colors.backgroundSecondary}
              alignItems="center"
              justifyContent="center"
            >
              <ArrowLeft size={22} color={colors.text} />
            </Stack>
          </Pressable>
          <Text fontSize={20} fontWeight="700" color={colors.text} marginLeft={14} flex={1}>
            거래 내역
          </Text>
        </Stack>
      </Animated.View>

      {/* Type Filter Tabs */}
      <Animated.View entering={FadeInDown.delay(100).duration(300)}>
        <Stack
          flexDirection="row"
          paddingHorizontal={20}
          paddingVertical={8}
          gap={8}
        >
          {TYPE_TABS.map((tab) => {
            const isActive = typeFilter === tab.key
            return (
              <Pressable key={tab.key} onPress={() => setTypeFilter(tab.key)}>
                <Stack
                  paddingHorizontal={18}
                  paddingVertical={10}
                  borderRadius={12}
                  backgroundColor={isActive ? colors.primary : colors.backgroundSecondary}
                >
                  <Text
                    fontSize={14}
                    fontWeight={isActive ? '700' : '500'}
                    color={isActive ? '#ffffff' : colors.textSecondary}
                  >
                    {tab.label}
                  </Text>
                </Stack>
              </Pressable>
            )
          })}
        </Stack>
      </Animated.View>

      {/* Transaction List */}
      <SectionList
        sections={groupedTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        renderSectionHeader={renderSectionHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        stickySectionHeadersEnabled
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Stack paddingVertical={80} alignItems="center">
              <Stack
                width={72}
                height={72}
                borderRadius={22}
                backgroundColor={`${colors.primary}10`}
                alignItems="center"
                justifyContent="center"
                marginBottom={16}
              >
                <Receipt size={32} color={colors.primary} />
              </Stack>
              <Text fontSize={17} fontWeight="600" color={colors.text}>
                거래 내역이 없습니다
              </Text>
              <Text fontSize={14} color={colors.textSecondary} marginTop={6}>
                새로운 거래가 생기면 여기에 표시됩니다
              </Text>
            </Stack>
          </Animated.View>
        }
      />
    </Screen>
  )
}
