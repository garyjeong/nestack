import { Link, useLocation } from 'react-router-dom'
import { Home, Target, CreditCard, User } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface NavItem {
  path: string
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { path: '/', label: '홈', icon: Home },
  { path: '/missions', label: '미션', icon: Target },
  { path: '/finance', label: '가계부', icon: CreditCard },
  { path: '/mypage', label: '마이', icon: User },
]

export function BottomNav() {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 px-4"
      style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* 플로팅 네비게이션 바 */}
      <div className="rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-stone-100">
        <div className="flex">
          {navItems.map((item) => {
            const active = isActive(item.path)
            const Icon = item.icon

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center min-h-[56px] py-2 transition-all duration-200',
                  'active:scale-95',
                  active
                    ? 'text-primary-600'
                    : 'text-stone-400 hover:text-stone-600'
                )}
              >
                <div className={cn(
                  'flex items-center justify-center rounded-xl transition-all duration-200',
                  active ? 'bg-primary-50' : 'bg-transparent',
                  'p-1.5'
                )}>
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                </div>
                <span className={cn(
                  'mt-0.5 text-[10px] transition-all',
                  active ? 'font-semibold text-primary-600' : 'font-medium'
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
