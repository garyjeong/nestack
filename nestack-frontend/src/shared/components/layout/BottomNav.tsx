import { Link, useLocation } from 'react-router-dom'
import { Home, ClipboardCheck, CreditCard, User } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface NavItem {
  path: string
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { path: '/', label: '홈', icon: Home },
  { path: '/missions', label: '미션', icon: ClipboardCheck },
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-lg">
        {navItems.map((item) => {
          const active = isActive(item.path)
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-1 flex-col items-center py-3 transition-colors',
                active ? 'text-primary-600' : 'text-stone-400 hover:text-stone-600'
              )}
            >
              <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
              <span className={cn('mt-1 text-xs', active && 'font-medium')}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
