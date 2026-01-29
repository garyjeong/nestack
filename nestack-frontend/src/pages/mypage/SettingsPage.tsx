import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import {
  ArrowLeft,
  Bell,
  Mail,
  ChevronRight,
  Key,
  CreditCard,
  FileText,
  Shield,
  Info,
  Trash2,
  X,
  AlertTriangle,
  Palette,
} from 'lucide-react'
import { AppShell, Page, AnimatedSection } from '@/shared/components/layout'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle'
import { ToggleSwitch } from '@/shared/components/ui/Interactions'
import { useAppStore } from '@/app/store'
import { apiClient } from '@/api/client'
import { showToast } from '@/shared/components/feedback/Toast'

interface NotificationSettings {
  pushEnabled: boolean
  emailEnabled: boolean
}

interface ShareSettings {
  shareBalance: boolean
  shareTransactions: boolean
  shareBadges: boolean
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { logout } = useAppStore()

  // Notification settings state
  const [notifications, setNotifications] = useState<NotificationSettings>({
    pushEnabled: true,
    emailEnabled: false,
  })

  // Share settings state
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    shareBalance: true,
    shareTransactions: true,
    shareBadges: false,
  })

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')

  // Save notification settings mutation
  const saveNotificationsMutation = useMutation({
    mutationFn: async (data: NotificationSettings) => {
      const response = await apiClient.patch('/users/me/notifications', data)
      return response.data.data
    },
    onSuccess: () => {
      showToast.success('알림 설정이 저장되었습니다.')
    },
    onError: () => {
      showToast.error('알림 설정 저장에 실패했습니다.')
    },
  })

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await apiClient.delete('/users/me', { data: { password } })
      return response.data
    },
    onSuccess: () => {
      showToast.success('계정이 삭제되었습니다.')
      logout()
      navigate('/auth/login')
    },
    onError: (error: Error & { response?: { data?: { error?: { message?: string } } } }) => {
      showToast.error(error.response?.data?.error?.message || '계정 삭제에 실패했습니다.')
    },
  })

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    const newSettings = { ...notifications, [key]: !notifications[key] }
    setNotifications(newSettings)
    saveNotificationsMutation.mutate(newSettings)
  }

  const handleShareChange = (key: keyof ShareSettings) => {
    setShareSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleDeleteAccount = () => {
    if (!deletePassword) {
      showToast.error('비밀번호를 입력해주세요.')
      return
    }
    deleteAccountMutation.mutate(deletePassword)
  }

  return (
    <AppShell showBottomNav={false}>
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white px-4 py-4 shadow-sm dark:bg-stone-900 dark:shadow-stone-800/50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg p-1 text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">설정</h1>
        </div>
      </header>

      <Page>
        <div className="space-y-6">
          {/* Notification Settings */}
          <AnimatedSection delay={0}>
            <h3 className="mb-3 text-lg font-semibold text-stone-900">알림</h3>
            <Card className="divide-y divide-stone-100">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-stone-500 dark:text-stone-400" />
                  <span className="text-stone-900 dark:text-stone-100">푸시 알림</span>
                </div>
                <ToggleSwitch
                  checked={notifications.pushEnabled}
                  onChange={() => handleNotificationChange('pushEnabled')}
                  label="푸시 알림 설정"
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-stone-500 dark:text-stone-400" />
                  <span className="text-stone-900 dark:text-stone-100">이메일 알림</span>
                </div>
                <ToggleSwitch
                  checked={notifications.emailEnabled}
                  onChange={() => handleNotificationChange('emailEnabled')}
                  label="이메일 알림 설정"
                />
              </div>
            </Card>
          </AnimatedSection>

          {/* Theme Settings */}
          <AnimatedSection delay={0.1}>
            <h3 className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-100">테마</h3>
            <Card className="p-4 dark:bg-stone-800 dark:border-stone-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Palette className="h-5 w-5 text-stone-500 dark:text-stone-400" />
                  <span className="text-stone-900 dark:text-stone-100">화면 모드</span>
                </div>
                <ThemeToggle />
              </div>
            </Card>
          </AnimatedSection>

          {/* Share Settings */}
          <AnimatedSection delay={0.15}>
            <h3 className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-100">공유 설정</h3>
            <Card className="p-4">
              <p className="mb-4 text-sm text-stone-500">파트너와 공유할 정보를 선택하세요</p>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={shareSettings.shareBalance}
                    onChange={() => handleShareChange('shareBalance')}
                    className="h-4 w-4 rounded border-stone-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-stone-900">계좌 잔액</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={shareSettings.shareTransactions}
                    onChange={() => handleShareChange('shareTransactions')}
                    className="h-4 w-4 rounded border-stone-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-stone-900">거래 내역</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={shareSettings.shareBadges}
                    onChange={() => handleShareChange('shareBadges')}
                    className="h-4 w-4 rounded border-stone-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-stone-900">뱃지 획득 알림</span>
                </label>
              </div>
            </Card>
          </AnimatedSection>

          {/* Account Settings */}
          <AnimatedSection delay={0.25}>
            <h3 className="mb-3 text-lg font-semibold text-stone-900">계정</h3>
            <Card className="divide-y divide-stone-100">
              <Link
                to="/auth/change-password"
                className="flex items-center justify-between p-4 transition-colors hover:bg-stone-50"
              >
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-stone-500" />
                  <span className="text-stone-900">비밀번호 변경</span>
                </div>
                <ChevronRight className="h-5 w-5 text-stone-400" />
              </Link>
              <Link
                to="/finance/openbanking"
                className="flex items-center justify-between p-4 transition-colors hover:bg-stone-50"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-stone-500" />
                  <span className="text-stone-900">연결된 계정 관리</span>
                </div>
                <ChevronRight className="h-5 w-5 text-stone-400" />
              </Link>
            </Card>
          </AnimatedSection>

          {/* Other Settings */}
          <AnimatedSection delay={0.35}>
            <h3 className="mb-3 text-lg font-semibold text-stone-900">기타</h3>
            <Card className="divide-y divide-stone-100">
              <Link
                to="/terms"
                className="flex items-center justify-between p-4 transition-colors hover:bg-stone-50"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-stone-500" />
                  <span className="text-stone-900">이용약관</span>
                </div>
                <ChevronRight className="h-5 w-5 text-stone-400" />
              </Link>
              <Link
                to="/privacy"
                className="flex items-center justify-between p-4 transition-colors hover:bg-stone-50"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-stone-500" />
                  <span className="text-stone-900">개인정보처리방침</span>
                </div>
                <ChevronRight className="h-5 w-5 text-stone-400" />
              </Link>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-stone-500" />
                  <span className="text-stone-900">버전</span>
                </div>
                <span className="text-stone-500">1.0.0</span>
              </div>
            </Card>
          </AnimatedSection>

          {/* Delete Account Button */}
          <AnimatedSection delay={0.45}>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white py-4 text-red-500 transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-5 w-5" />
              <span className="font-medium">회원 탈퇴</span>
            </button>
          </AnimatedSection>
        </div>
      </Page>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between">
              <h2 className="text-xl font-bold text-stone-900">회원 탈퇴</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-stone-400 transition-colors hover:text-stone-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6 flex items-start gap-4 rounded-xl bg-amber-50 p-4">
              <AlertTriangle className="h-6 w-6 flex-shrink-0 text-amber-500" />
              <div>
                <p className="font-medium text-amber-800">주의사항</p>
                <p className="mt-1 text-sm text-amber-700">
                  회원 탈퇴 시 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다. 가족 그룹에서도
                  자동으로 탈퇴됩니다.
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-stone-700">
                비밀번호 확인
              </label>
              <Input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
                disabled={deleteAccountMutation.isPending}
              >
                취소
              </Button>
              <Button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-500 hover:bg-red-600"
                isLoading={deleteAccountMutation.isPending}
                disabled={!deletePassword || deleteAccountMutation.isPending}
              >
                탈퇴하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
