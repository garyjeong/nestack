import { Users, UserPlus, Crown, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@/shared/components/ui/Card'
import { Avatar } from '@/shared/components/ui/Avatar'
import { Button } from '@/shared/components/ui/Button'
import { Skeleton } from '@/shared/components/feedback'
import { useFamily } from '../hooks'
import type { FamilyMember } from '../types'

export function FamilyInfo() {
  const { familyGroup, isLoading } = useFamily()

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-1 h-4 w-24" />
          </div>
        </div>
      </Card>
    )
  }

  if (!familyGroup) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
            <UserPlus className="h-6 w-6 text-stone-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-stone-900">파트너 연결하기</p>
            <p className="text-sm text-stone-500">초대 코드로 연결하세요</p>
          </div>
          <Link to="/onboarding">
            <Button size="sm" variant="outline">
              연결
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  const partner = familyGroup.members.find(
    (m) => m.role === 'member'
  ) as FamilyMember | undefined

  const owner = familyGroup.members.find(
    (m) => m.role === 'owner'
  ) as FamilyMember | undefined

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary-600" />
          <h3 className="font-semibold text-stone-900">Duo-Sync</h3>
        </div>
        <Link
          to="/mypage/family"
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          관리
          <ExternalLink className="ml-1 inline h-3 w-3" />
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Owner */}
        {owner && (
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar
                name={owner.user.name}
                src={owner.user.profileImage || undefined}
                size="lg"
              />
              <div className="absolute -bottom-1 -right-1 rounded-full bg-yellow-400 p-1">
                <Crown className="h-3 w-3 text-yellow-800" />
              </div>
            </div>
            <p className="mt-2 text-sm font-medium text-stone-900">
              {owner.user.name}
            </p>
            <p className="text-xs text-stone-500">나</p>
          </div>
        )}

        {/* Connection Line */}
        <div className="flex-1 flex items-center justify-center">
          <div className="h-0.5 w-full bg-gradient-to-r from-primary-200 via-accent-300 to-primary-200" />
        </div>

        {/* Partner */}
        {partner ? (
          <div className="flex flex-col items-center">
            <Avatar
              name={partner.user.name}
              src={partner.user.profileImage || undefined}
              size="lg"
            />
            <p className="mt-2 text-sm font-medium text-stone-900">
              {partner.user.name}
            </p>
            <p className="text-xs text-stone-500">파트너</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-stone-300 bg-stone-50">
              <UserPlus className="h-5 w-5 text-stone-400" />
            </div>
            <p className="mt-2 text-sm text-stone-500">대기 중</p>
            <Link to="/onboarding/invite">
              <Button size="sm" variant="link" className="text-xs">
                초대하기
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  )
}
