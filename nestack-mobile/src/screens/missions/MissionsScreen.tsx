import React, { useState, useCallback } from 'react'
import { FlatList, Pressable, RefreshControl } from 'react-native'
import { Stack, Text } from 'tamagui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Screen } from '../../shared/components/layout/Screen'
import { useMissions, useLifeCycleCategories } from '../../features/mission/hooks'
import { formatCompactCurrency } from '../../shared/utils/format'
import type { Mission, MissionStatus, LifeCycleCategory } from '../../features/mission/types'
import type { MissionStackParamList } from '../../app/navigation/types'
import { Target, Plus, Calendar, ChevronRight } from 'lucide-react-native'

type Props = NativeStackScreenProps<MissionStackParamList, 'Missions'>

const STATUS_TABS: { key: MissionStatus | 'all'; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'in_progress', label: '진행중' },
  { key: 'completed', label: '완료' },
  { key: 'failed', label: '실패' },
]

export default function MissionsScreen({ navigation }: Props) {
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
        return '#059669'
      case 'completed':
        return '#3b82f6'
      case 'failed':
        return '#ef4444'
      case 'pending':
        return '#f59e0b'
      case 'cancelled':
        return '#a8a29e'
      default:
        return '#78716c'
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

  const renderCategoryChip = (category: LifeCycleCategory) => {
    const isSelected = selectedCategoryId === category.id
    return (
      <Pressable
        key={category.id}
        onPress={() =>
          setSelectedCategoryId(isSelected ? undefined : category.id)
        }
      >
        <Stack
          paddingHorizontal={14}
          paddingVertical={8}
          borderRadius={20}
          backgroundColor={isSelected ? '#059669' : '#ffffff'}
          borderWidth={1}
          borderColor={isSelected ? '#059669' : '#e7e5e4'}
          marginRight={8}
        >
          <Text
            fontSize={13}
            fontWeight="500"
            color={isSelected ? '#ffffff' : '#57534e'}
          >
            {category.name}
          </Text>
        </Stack>
      </Pressable>
    )
  }

  const renderMissionItem = ({ item }: { item: Mission }) => (
    <Pressable onPress={() => navigation.navigate('MissionDetail', { id: item.id })}>
      <Stack
        backgroundColor="#ffffff"
        borderRadius={16}
        padding={16}
        marginHorizontal={20}
        marginBottom={12}
        borderWidth={1}
        borderColor="#f5f5f4"
      >
        <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
          <Stack flexDirection="row" alignItems="center" flex={1}>
            <Stack
              width={44}
              height={44}
              borderRadius={12}
              backgroundColor="#ecfdf5"
              alignItems="center"
              justifyContent="center"
            >
              <Target size={22} color="#059669" />
            </Stack>
            <Stack flex={1} marginLeft={12}>
              <Text fontSize={15} fontWeight="600" color="#1c1917" numberOfLines={1}>
                {item.name}
              </Text>
              <Stack flexDirection="row" alignItems="center" gap={6} marginTop={4}>
                <Stack
                  paddingHorizontal={6}
                  paddingVertical={2}
                  borderRadius={4}
                  backgroundColor={getStatusColor(item.status) + '15'}
                >
                  <Text
                    fontSize={11}
                    fontWeight="600"
                    color={getStatusColor(item.status)}
                  >
                    {getStatusLabel(item.status)}
                  </Text>
                </Stack>
                <Stack flexDirection="row" alignItems="center" gap={2}>
                  <Calendar size={11} color="#a8a29e" />
                  <Text fontSize={11} color="#a8a29e">
                    D-{item.daysRemaining}
                  </Text>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
          <ChevronRight size={20} color="#d6d3d1" />
        </Stack>

        {/* Progress */}
        <Stack marginTop={14}>
          <Stack flexDirection="row" justifyContent="space-between" marginBottom={6}>
            <Text fontSize={12} color="#78716c">
              {formatCompactCurrency(item.currentAmount)} /{' '}
              {formatCompactCurrency(item.targetAmount)}
            </Text>
            <Text fontSize={12} fontWeight="600" color="#059669">
              {Math.round(item.progress)}%
            </Text>
          </Stack>
          <Stack
            height={6}
            borderRadius={3}
            backgroundColor="#f5f5f4"
            overflow="hidden"
          >
            <Stack
              height={6}
              borderRadius={3}
              backgroundColor="#059669"
              width={`${Math.min(item.progress, 100)}%` as any}
            />
          </Stack>
        </Stack>
      </Stack>
    </Pressable>
  )

  const renderEmpty = () => (
    <Stack flex={1} alignItems="center" justifyContent="center" paddingTop={60}>
      <Stack
        width={64}
        height={64}
        borderRadius={32}
        backgroundColor="#f5f5f4"
        alignItems="center"
        justifyContent="center"
        marginBottom={16}
      >
        <Target size={28} color="#a8a29e" />
      </Stack>
      <Text fontSize={16} fontWeight="600" color="#78716c">
        미션이 없습니다
      </Text>
      <Text fontSize={13} color="#a8a29e" marginTop={4} textAlign="center">
        새로운 미션을 만들어 저축 목표를 시작하세요
      </Text>
    </Stack>
  )

  return (
    <Screen edges={['top']}>
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
          미션
        </Text>
      </Stack>

      {/* Category Chips */}
      {categories && categories.length > 0 && (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderCategoryChip(item)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 8 }}
          style={{ flexGrow: 0 }}
        />
      )}

      {/* Status Tabs */}
      <Stack
        flexDirection="row"
        paddingHorizontal={20}
        paddingVertical={8}
        gap={4}
      >
        {STATUS_TABS.map((tab) => {
          const isActive = selectedStatus === tab.key
          return (
            <Pressable key={tab.key} onPress={() => setSelectedStatus(tab.key)}>
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

      {/* Mission List */}
      <FlatList
        data={missions}
        keyExtractor={(item) => item.id}
        renderItem={renderMissionItem}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#059669" />
        }
      />

      {/* FAB */}
      <Pressable
        onPress={() => navigation.navigate('MissionCreate', {})}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 20,
        }}
      >
        <Stack
          width={56}
          height={56}
          borderRadius={28}
          backgroundColor="#059669"
          alignItems="center"
          justifyContent="center"
          shadowColor="#000000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.15}
          shadowRadius={8}
        >
          <Plus size={28} color="#ffffff" />
        </Stack>
      </Pressable>
    </Screen>
  )
}
