import React, { useState, useCallback } from 'react'
import { FlatList, Pressable, RefreshControl } from 'react-native'
import { Stack, Text } from 'tamagui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated'
import { Screen } from '../../shared/components/layout/Screen'
import { Card } from '../../shared/components/ui/Card'
import { CompactProgressBar } from '../../shared/components/ui/ProgressBar'
import { FAB } from '../../shared/components/ui/Button'
import { useTheme } from '../../shared/hooks/useTheme'
import { useMissions, useLifeCycleCategories } from '../../features/mission/hooks'
import { formatCompactCurrency } from '../../shared/utils/format'
import type { Mission, MissionStatus, LifeCycleCategory } from '../../features/mission/types'
import type { MissionStackParamList } from '../../app/navigation/types'
import { Target, Plus, Calendar, ChevronRight, Sparkles, CheckCircle, XCircle, Clock } from 'lucide-react-native'

type Props = NativeStackScreenProps<MissionStackParamList, 'Missions'>

type StatusTabKey = MissionStatus | 'all'

const STATUS_TABS: { key: StatusTabKey; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'in_progress', label: '진행중' },
  { key: 'completed', label: '완료' },
  { key: 'failed', label: '실패' },
]

const getStatusIcon = (key: StatusTabKey, color: string) => {
  switch (key) {
    case 'in_progress':
      return <Sparkles size={14} color={color} />
    case 'completed':
      return <CheckCircle size={14} color={color} />
    case 'failed':
      return <XCircle size={14} color={color} />
    default:
      return null
  }
}

export default function MissionsScreen({ navigation }: Props) {
  const { colors, palette } = useTheme()
  const [selectedStatus, setSelectedStatus] = useState<MissionStatus | 'all'>('all')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined)

  const { data: categories } = useLifeCycleCategories()

  const {
    missions,
    isLoading,
    refetch,
  } = useMissions({
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    categoryId: selectedCategoryId,
  })

  const onRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  const getStatusColor = (status: MissionStatus) => {
    switch (status) {
      case 'in_progress':
        return colors.primary
      case 'completed':
        return colors.success
      case 'failed':
        return colors.error
      case 'pending':
        return colors.warning
      case 'cancelled':
        return colors.textTertiary
      default:
        return colors.textSecondary
    }
  }

  const getStatusLabel = (status: MissionStatus) => {
    switch (status) {
      case 'in_progress':
        return '진행중'
      case 'completed':
        return '완료'
      case 'failed':
        return '실패'
      case 'pending':
        return '대기'
      case 'cancelled':
        return '취소'
      default:
        return status
    }
  }

  const getCategoryIcon = (categoryName: string) => {
    // Return different icons based on category name
    return <Target size={22} color={colors.primary} />
  }

  const renderCategoryChip = (category: LifeCycleCategory, index: number) => {
    const isSelected = selectedCategoryId === category.id
    return (
      <Animated.View key={category.id} entering={FadeInRight.delay(index * 50).duration(300)}>
        <Pressable
          onPress={() =>
            setSelectedCategoryId(isSelected ? undefined : category.id)
          }
        >
          <Stack
            paddingHorizontal={16}
            paddingVertical={10}
            borderRadius={12}
            backgroundColor={isSelected ? colors.primary : colors.card}
            borderWidth={1}
            borderColor={isSelected ? colors.primary : colors.border}
            marginRight={8}
          >
            <Text
              fontSize={14}
              fontWeight="600"
              color={isSelected ? '#ffffff' : colors.text}
            >
              {category.name}
            </Text>
          </Stack>
        </Pressable>
      </Animated.View>
    )
  }

  const renderMissionItem = ({ item, index }: { item: Mission; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <Pressable onPress={() => navigation.navigate('MissionDetail', { id: item.id })}>
        <Card
          variant="elevated"
          style={{ marginHorizontal: 20, marginBottom: 12 }}
        >
          <Stack padding={18}>
            <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
              <Stack flexDirection="row" alignItems="center" flex={1}>
                <Stack
                  width={48}
                  height={48}
                  borderRadius={4}
                  backgroundColor={`${colors.primary}15`}
                  alignItems="center"
                  justifyContent="center"
                >
                  {getCategoryIcon(item.category?.name || '')}
                </Stack>
                <Stack flex={1} marginLeft={14}>
                  <Text fontSize={16} fontWeight="600" color={colors.text} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Stack flexDirection="row" alignItems="center" gap={8} marginTop={6}>
                    <Stack
                      paddingHorizontal={8}
                      paddingVertical={3}
                      borderRadius={6}
                      backgroundColor={getStatusColor(item.status) + '15'}
                    >
                      <Text
                        fontSize={11}
                        fontWeight="700"
                        color={getStatusColor(item.status)}
                      >
                        {getStatusLabel(item.status)}
                      </Text>
                    </Stack>
                    <Stack flexDirection="row" alignItems="center" gap={4}>
                      <Clock size={12} color={colors.textTertiary} />
                      <Text fontSize={12} fontWeight="500" color={colors.textTertiary}>
                        D-{item.daysRemaining}
                      </Text>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
              <ChevronRight size={22} color={colors.border} />
            </Stack>

            {/* Progress */}
            <Stack marginTop={16}>
              <Stack flexDirection="row" justifyContent="space-between" marginBottom={8}>
                <Text fontSize={13} color={colors.textSecondary}>
                  {formatCompactCurrency(item.currentAmount)} /{' '}
                  {formatCompactCurrency(item.targetAmount)}
                </Text>
                <Text fontSize={14} fontWeight="700" color={colors.primary}>
                  {Math.round(item.progress)}%
                </Text>
              </Stack>
              <CompactProgressBar progress={item.progress} height={8} />
            </Stack>
          </Stack>
        </Card>
      </Pressable>
    </Animated.View>
  )

  const renderEmpty = () => (
    <Animated.View entering={FadeInDown.delay(200).duration(500)}>
      <Stack flex={1} alignItems="center" justifyContent="center" paddingTop={80}>
        <Stack
          width={80}
          height={80}
          borderRadius={24}
          backgroundColor={`${colors.primary}10`}
          alignItems="center"
          justifyContent="center"
          marginBottom={20}
        >
          <Target size={36} color={colors.primary} />
        </Stack>
        <Text fontSize={18} fontWeight="700" color={colors.text}>
          미션이 없습니다
        </Text>
        <Text fontSize={14} color={colors.textSecondary} marginTop={8} textAlign="center">
          새로운 미션을 만들어{'\n'}저축 목표를 시작하세요
        </Text>
      </Stack>
    </Animated.View>
  )

  return (
    <Screen edges={['top']}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <Stack
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal={20}
          paddingTop={16}
          paddingBottom={8}
        >
          <Text fontSize={26} fontWeight="800" color={colors.text}>
            미션
          </Text>
        </Stack>
      </Animated.View>

      {/* Category Chips */}
      {categories && categories.length > 0 && (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => renderCategoryChip(item, index)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}
          style={{ flexGrow: 0 }}
        />
      )}

      {/* Status Tabs */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <Stack
          flexDirection="row"
          paddingHorizontal={20}
          paddingVertical={8}
          gap={6}
        >
          {STATUS_TABS.map((tab) => {
            const isActive = selectedStatus === tab.key
            const iconColor = isActive ? '#ffffff' : colors.textSecondary
            return (
              <Pressable key={tab.key} onPress={() => setSelectedStatus(tab.key)}>
                <Stack
                  flexDirection="row"
                  alignItems="center"
                  gap={6}
                  paddingHorizontal={16}
                  paddingVertical={10}
                  borderRadius={12}
                  backgroundColor={isActive ? colors.primary : colors.backgroundSecondary}
                >
                  {getStatusIcon(tab.key, iconColor)}
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

      {/* Mission List */}
      <FlatList
        data={missions}
        keyExtractor={(item) => item.id}
        renderItem={renderMissionItem}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />

      {/* FAB */}
      <Stack
        position="absolute"
        bottom={24}
        right={20}
      >
        <FAB
          icon={<Plus size={28} color="#ffffff" />}
          onPress={() => navigation.navigate('MissionCreate', {})}
        />
      </Stack>
    </Screen>
  )
}
