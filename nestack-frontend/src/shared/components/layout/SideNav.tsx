import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Target,
  CreditCard,
  User,
  Settings,
  Users,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useAppStore } from '@/app/store'
import { Avatar } from '@/shared/components/ui/Avatar'

interface NavItem {
  path: string
  label: string
  icon: React.ElementType
}

const mainNavItems: NavItem[] = [
  { path: '/', label: '홈', icon: Home },
  { path: '/missions', label: '미션', icon: Target },
  { path: '/finance', label: '가계부', icon: CreditCard },
  { path: '/mypage', label: '마이페이지', icon: User },
]

const subNavItems: NavItem[] = [
  { path: '/family/settings', label: '가족 설정', icon: Users },
  { path: '/mypage/settings', label: '설정', icon: Settings },
]

export function SideNav() {
  const location = useLocation()
  const { user, logout } = useAppStore()

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="fixed left-0 top-0 hidden h-full w-72 flex-col bg-white lg:flex border-r border-stone-100">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link to="/" className="flex items-center">
          <img src="/logo.svg" alt="Nestack" className="h-8" />
        </Link>
      </div>

      {/* User Info Card */}
      {user && (
        <div className="px-4 pb-4">
          <Link
            to="/mypage"
            className="flex items-center gap-3 rounded-2xl bg-stone-50 p-4 transition-colors hover:bg-stone-100"
          >
            <Avatar
              src={user.profileImage}
              name={user.name}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-stone-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-stone-500 truncate">{user.email}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-stone-400" />
          </Link>
        </div>
      )}

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const active = isActive(item.path)
            const Icon = item.icon

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  'active:scale-[0.98]',
                  active
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Divider */}
        <div className="my-4 mx-3 border-t border-stone-100" />

        {/* Sub Navigation */}
        <div className="space-y-1">
          <p className="px-4 py-2 text-xs font-medium text-stone-400 uppercase tracking-wide">
            설정
          </p>
          {subNavItems.map((item) => {
            const active = isActive(item.path)
            const Icon = item.icon

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
                  'active:scale-[0.98]',
                  active
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Logout */}
      <div className="border-t border-stone-100 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-stone-500 transition-all duration-200 hover:bg-stone-50 hover:text-stone-700 active:scale-[0.98]"
        >
          <LogOut className="h-5 w-5" />
          <span>로그아웃</span>
        </button>
      </div>
    </nav>
  )
}
