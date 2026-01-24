import { Link } from 'react-router-dom'
import {
  ChevronRight,
  Settings,
  Users,
  LogOut,
  Bell,
  Shield,
  HelpCircle,
  Heart,
  Calendar,
} from 'lucide-react'
import { AppShell, Page } from '@/shared/components/layout'
import { Card } from '@/shared/components/ui/Card'
import { Avatar } from '@/shared/components/ui/Avatar'
import { useAppStore } from '@/app/store'

// 뱃지 목업 데이터
const mockBadges = [
  { id: '1', name: '첫 미션', icon: '🎯', color: 'bg-blue-100' },
  { id: '2', name: '7일 연속', icon: '🔥', color: 'bg-orange-100' },
  { id: '3', name: '첫 저축', icon: '💰', color: 'bg-green-100' },
  { id: '4', name: '커플 시작', icon: '💑', color: 'bg-pink-100' },
]

export default function MyPage() {
  const { user, logout } = useAppStore()

  // D+ 일수 계산 (목업)
  const partnerDays = 365

  const handleLogout = () => {
    logout()
  }

  return (
    <AppShell>
      {/* 모바일 헤더 */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 py-3 lg:hidden">
        <div className="mx-auto max-w-lg">
          <h1 className="text-xl font-bold text-stone-900">마이페이지</h1>
        </div>
      </header>

      <Page className="pb-24 lg:pb-8">
        {/* 프로필 섹션 - 중앙 정렬 */}
        <section className="mb-6">
          <Card className="p-6 text-center">
            <div className="flex flex-col items-center">
              {/* 큰 아바타 */}
              <Avatar
                src={user?.profileImage}
                name={user?.name || ''}
                size="xl"
                className="mb-4 ring-4 ring-stone-100"
              />

              {/* 이름 */}
              <h2 className="text-xl font-bold text-stone-900 mb-1">
                {user?.name || '사용자'}
              </h2>

              {/* 이메일 */}
              <p className="text-sm text-stone-500 mb-3">{user?.email}</p>

              {/* 이메일 인증 배지 */}
              {user?.emailVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  <Shield className="h-3 w-3" />
                  이메일 인증됨
                </span>
              )}

              {/* 프로필 수정 버튼 */}
              <Link to="/mypage/profile" className="mt-4">
                <button className="h-10 px-5 rounded-xl border border-stone-200 text-stone-700 text-sm font-medium hover:bg-stone-50 transition-colors active:scale-[0.98]">
                  프로필 수정
                </button>
              </Link>
            </div>
          </Card>
        </section>

        {/* 파트너 카드 */}
        {user?.familyGroupId && (
          <section className="mb-6">
            <Card className="p-5 bg-gradient-to-r from-accent-50 to-primary-50 border border-accent-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    <Avatar
                      src={user?.profileImage}
                      name={user?.name || ''}
                      size="md"
                      className="ring-2 ring-white"
                    />
                    <Avatar
                      name="파트너"
                      size="md"
                      className="ring-2 ring-white bg-accent-100 text-accent-600"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-accent-500" />
                      <span className="font-semibold text-stone-900">
                        D+{partnerDays}일째
                      </span>
                    </div>
                    <p className="text-sm text-stone-500 mt-0.5">
                      파트너와 함께하고 있어요
                    </p>
                  </div>
                </div>
                <Link to="/family/settings">
                  <ChevronRight className="h-5 w-5 text-stone-400" />
                </Link>
              </div>
            </Card>
          </section>
        )}

        {/* 뱃지 섹션 */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-stone-900">뱃지</h3>
            <Link
              to="/mypage/badges"
              className="flex items-center gap-0.5 text-sm text-stone-500 hover:text-stone-700"
            >
              {mockBadges.length}개 획득 <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* 뱃지 가로 스크롤 */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
            {mockBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex-shrink-0 flex flex-col items-center gap-2"
              >
                <div
                  className={`h-14 w-14 rounded-2xl ${badge.color} flex items-center justify-center text-2xl`}
                >
                  {badge.icon}
                </div>
                <span className="text-xs text-stone-600 font-medium whitespace-nowrap">
                  {badge.name}
                </span>
              </div>
            ))}

            {/* 더보기 */}
            <Link
              to="/mypage/badges"
              className="flex-shrink-0 flex flex-col items-center gap-2"
            >
              <div className="h-14 w-14 rounded-2xl bg-stone-100 flex items-center justify-center">
                <span className="text-stone-400 text-lg">+</span>
              </div>
              <span className="text-xs text-stone-400 font-medium">더보기</span>
            </Link>
          </div>
        </section>

        {/* 설정 메뉴 */}
        <section className="mb-6">
          <h3 className="text-lg font-bold text-stone-900 mb-4">설정</h3>
          <Card className="overflow-hidden">
            <MenuItem
              to="/mypage/settings"
              icon={<Settings className="h-5 w-5" />}
              label="앱 설정"
              description="알림, 테마, 언어"
            />
            <MenuItem
              to="/family/settings"
              icon={<Users className="h-5 w-5" />}
              label="데이터 공유 설정"
              description="파트너와 공유할 정보"
            />
            <MenuItem
              to="/mypage/notifications"
              icon={<Bell className="h-5 w-5" />}
              label="알림 설정"
              description="푸시 알림 관리"
            />
          </Card>
        </section>

        {/* 지원 메뉴 */}
        <section className="mb-6">
          <h3 className="text-lg font-bold text-stone-900 mb-4">지원</h3>
          <Card className="overflow-hidden">
            <MenuItem
              to="/help"
              icon={<HelpCircle className="h-5 w-5" />}
              label="도움말"
              description="자주 묻는 질문"
            />
            <MenuItem
              to="/mypage/version"
              icon={<Calendar className="h-5 w-5" />}
              label="버전 정보"
              description="v1.0.0"
            />
          </Card>
        </section>

        {/* 로그아웃 버튼 */}
        <section>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white py-4 text-red-500 font-medium transition-colors hover:bg-red-50 active:scale-[0.99]"
          >
            <LogOut className="h-5 w-5" />
            <span>로그아웃</span>
          </button>
        </section>
      </Page>
    </AppShell>
  )
}

// 메뉴 아이템 컴포넌트
interface MenuItemProps {
  to: string
  icon: React.ReactNode
  label: string
  description?: string
}

function MenuItem({ to, icon, label, description }: MenuItemProps) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 p-4 transition-colors hover:bg-stone-50 active:bg-stone-100 border-b border-stone-100 last:border-0"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-stone-900">{label}</p>
        {description && (
          <p className="text-sm text-stone-500">{description}</p>
        )}
      </div>
      <ChevronRight className="h-5 w-5 text-stone-400" />
    </Link>
  )
}
