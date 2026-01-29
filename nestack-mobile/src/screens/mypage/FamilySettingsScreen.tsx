import React from 'react'
import { ScrollView, Pressable, Switch, Alert } from 'react-native'
import { Stack, Text } from 'tamagui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Screen } from '../../shared/components/layout/Screen'
import { Button } from '../../shared/components/ui/Button'
import { useFamily, useLeaveFamily, useRegenerateInviteCode, useUpdateShareSettings } from '../../features/family/hooks'
import { useAccounts } from '../../features/finance/hooks'
import type { BankAccount } from '../../features/finance/types'
import type { MyPageStackParamList } from '../../app/navigation/types'
import {
  ArrowLeft,
  Users,
  Landmark,
  Copy,
  Eye,
  EyeOff,
  LogOut as LeaveIcon,
  RefreshCw,
} from 'lucide-react-native'
import Toast from 'react-native-toast-message'

type Props = NativeStackScreenProps<MyPageStackParamList, 'FamilySettings'>

export default function FamilySettingsScreen({ navigation }: Props) {
  const { familyGroup, inviteCode: inviteCodeData, isLoading: isFamilyLoading, refetch: refetchFamily } = useFamily()
  const { accounts } = useAccounts()
  const { mutate: updateShareSettings, isPending: isUpdating } = useUpdateShareSettings()
  const { mutate: leaveFamilyMutation, isPending: isLeaving } = useLeaveFamily()
  const { mutate: regenerateInviteCode, isPending: isRegenerating } = useRegenerateInviteCode()

  const inviteCode = inviteCodeData?.code ?? ''

  const handleLeaveFamily = () => {
    Alert.alert(
      '가족 탈퇴',
      '정말로 가족 그룹에서 탈퇴하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴',
          style: 'destructive',
          onPress: () => leaveFamilyMutation({ password: '', keepMissions: 'keep' }),
        },
      ],
    )
  }

  const handleCopyInviteCode = () => {
    if (inviteCode) {
      Toast.show({
        type: 'info',
        text1: '초대코드',
        text2: inviteCode,
      })
    }
  }

  const handleToggleAccountShare = (accountId: string, shouldShare: boolean) => {
    updateShareSettings({
      accounts: [
        {
          accountId,
          shareStatus: shouldShare ? 'full' : 'private',
        },
      ],
    })
  }

  if (!familyGroup) {
    return (
      <Screen edges={['top']}>
        <Stack
          flexDirection="row"
          alignItems="center"
          paddingHorizontal={16}
          paddingVertical={12}
        >
          <Pressable onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#1c1917" />
          </Pressable>
          <Text fontSize={18} fontWeight="700" color="#1c1917" marginLeft={12}>
            가족 설정
          </Text>
        </Stack>
        <Stack flex={1} justifyContent="center" alignItems="center" paddingHorizontal={24}>
          <Stack
            width={64}
            height={64}
            borderRadius={32}
            backgroundColor="#f5f5f4"
            alignItems="center"
            justifyContent="center"
            marginBottom={16}
          >
            <Users size={28} color="#a8a29e" />
          </Stack>
          <Text fontSize={16} fontWeight="600" color="#78716c">
            가족 그룹에 가입되어 있지 않습니다
          </Text>
          <Text fontSize={13} color="#a8a29e" marginTop={4} textAlign="center">
            가족 그룹을 만들거나 초대코드로 참여하세요
          </Text>
        </Stack>
      </Screen>
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
        <Text fontSize={18} fontWeight="700" color="#1c1917" marginLeft={12}>
          가족 설정
        </Text>
      </Stack>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 24 }}
      >
        {/* Family Info */}
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
              backgroundColor="#ecfdf5"
              alignItems="center"
              justifyContent="center"
            >
              <Users size={24} color="#059669" />
            </Stack>
            <Stack flex={1}>
              <Text fontSize={18} fontWeight="700" color="#1c1917">
                {familyGroup.name ?? '가족 그룹'}
              </Text>
              <Text fontSize={13} color="#78716c" marginTop={2}>
                구성원 {familyGroup.members?.length ?? 0}명
              </Text>
            </Stack>
          </Stack>
        </Stack>

        {/* Invite Code */}
        <Stack gap={8}>
          <Text fontSize={12} fontWeight="600" color="#a8a29e" marginLeft={4}>
            초대코드
          </Text>
          <Stack
            backgroundColor="#ffffff"
            borderRadius={16}
            padding={16}
            borderWidth={1}
            borderColor="#f5f5f4"
          >
            <Stack
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text fontSize={18} fontWeight="700" color="#1c1917" letterSpacing={2}>
                {inviteCode || '----'}
              </Text>
              <Stack flexDirection="row" gap={8}>
                <Pressable onPress={handleCopyInviteCode}>
                  <Stack
                    width={36}
                    height={36}
                    borderRadius={10}
                    backgroundColor="#ecfdf5"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Copy size={18} color="#059669" />
                  </Stack>
                </Pressable>
                <Pressable onPress={() => regenerateInviteCode()}>
                  <Stack
                    width={36}
                    height={36}
                    borderRadius={10}
                    backgroundColor="#f5f5f4"
                    alignItems="center"
                    justifyContent="center"
                    opacity={isRegenerating ? 0.5 : 1}
                  >
                    <RefreshCw size={18} color="#78716c" />
                  </Stack>
                </Pressable>
              </Stack>
            </Stack>
            <Text fontSize={12} color="#a8a29e" marginTop={8}>
              이 코드를 파트너에게 공유하여 가족 그룹에 초대하세요
            </Text>
          </Stack>
        </Stack>

        {/* Account Share Settings */}
        <Stack gap={8}>
          <Text fontSize={12} fontWeight="600" color="#a8a29e" marginLeft={4}>
            계좌 공유 설정
          </Text>
          {accounts.length > 0 ? (
            <Stack
              backgroundColor="#ffffff"
              borderRadius={16}
              borderWidth={1}
              borderColor="#f5f5f4"
              overflow="hidden"
            >
              {accounts.map((account: BankAccount, index: number) => {
                const isShared = account.shareStatus !== 'private'
                return (
                  <Stack
                    key={account.id}
                    flexDirection="row"
                    alignItems="center"
                    paddingHorizontal={16}
                    paddingVertical={14}
                    borderBottomWidth={index < accounts.length - 1 ? 1 : 0}
                    borderBottomColor="#f5f5f4"
                  >
                    <Stack
                      width={36}
                      height={36}
                      borderRadius={10}
                      backgroundColor="#eff6ff"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Landmark size={18} color="#3b82f6" />
                    </Stack>
                    <Stack flex={1} marginLeft={12}>
                      <Text fontSize={14} fontWeight="500" color="#1c1917">
                        {account.accountAlias ?? account.bankName}
                      </Text>
                      <Text fontSize={12} color="#a8a29e" marginTop={1}>
                        {account.bankName}
                      </Text>
                    </Stack>
                    <Stack flexDirection="row" alignItems="center" gap={6}>
                      {isShared ? (
                        <Eye size={16} color="#059669" />
                      ) : (
                        <EyeOff size={16} color="#a8a29e" />
                      )}
                      <Switch
                        value={isShared}
                        onValueChange={(value) =>
                          handleToggleAccountShare(account.id, value)
                        }
                        trackColor={{ false: '#e7e5e4', true: '#059669' }}
                        thumbColor="#ffffff"
                      />
                    </Stack>
                  </Stack>
                )
              })}
            </Stack>
          ) : (
            <Stack
              backgroundColor="#ffffff"
              borderRadius={16}
              padding={20}
              alignItems="center"
              borderWidth={1}
              borderColor="#f5f5f4"
            >
              <Text fontSize={13} color="#a8a29e">
                연결된 계좌가 없습니다
              </Text>
            </Stack>
          )}
          <Text fontSize={12} color="#a8a29e" marginLeft={4}>
            공유된 계좌는 가족 구성원에게 거래 내역이 표시됩니다
          </Text>
        </Stack>

        {/* Leave Family */}
        <Stack marginTop={8}>
          <Button
            variant="outline"
            onPress={handleLeaveFamily}
            isLoading={isLeaving}
            fullWidth
            size="lg"
          >
            <Stack flexDirection="row" alignItems="center" gap={8}>
              <LeaveIcon size={18} color="#ef4444" />
              <Text fontSize={15} fontWeight="600" color="#ef4444">
                가족 탈퇴
              </Text>
            </Stack>
          </Button>
          <Text fontSize={12} color="#a8a29e" textAlign="center" marginTop={8}>
            가족 그룹에서 탈퇴하면 공유 설정이 모두 해제됩니다
          </Text>
        </Stack>
      </ScrollView>
    </Screen>
  )
}
