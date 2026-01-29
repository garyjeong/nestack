import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Camera } from 'lucide-react'
import { AppShell, Page, AnimatedSection } from '@/shared/components/layout'
import { Card } from '@/shared/components/ui/Card'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { Avatar } from '@/shared/components/ui/Avatar'
import { useAppStore } from '@/app/store'
import { apiClient } from '@/api/client'
import { showToast } from '@/shared/components/feedback/Toast'

const profileSchema = z.object({
  name: z
    .string()
    .min(2, '이름은 2자 이상이어야 합니다')
    .max(50, '이름은 50자 이하여야 합니다'),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfileEditPage() {
  const navigate = useNavigate()
  const { user, setUser } = useAppStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiClient.patch('/users/me', data)
      return response.data.data
    },
    onSuccess: (updatedUser) => {
      if (user) {
        setUser({ ...user, ...updatedUser })
      }
      showToast.success('프로필이 수정되었습니다.')
      navigate('/mypage')
    },
    onError: (error: Error & { response?: { data?: { error?: { message?: string } } } }) => {
      showToast.error(error.response?.data?.error?.message || '프로필 수정에 실패했습니다.')
    },
  })

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data)
  }

  return (
    <AppShell showBottomNav={false}>
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg p-1 text-stone-600 transition-colors hover:bg-stone-100"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-stone-900">프로필 수정</h1>
        </div>
      </header>

      <Page>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Image */}
          <AnimatedSection delay={0} className="flex justify-center">
            <div className="relative">
              <Avatar
                src={user?.profileImage}
                name={user?.name || ''}
                size="xl"
                className="h-24 w-24"
              />
              <button
                type="button"
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-white shadow-md transition-colors hover:bg-primary-600"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
          </AnimatedSection>

          {/* Form Fields */}
          <AnimatedSection delay={0.1}>
            <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-stone-700">
                  이름
                </label>
                <Input
                  id="name"
                  type="text"
                  {...register('name')}
                  error={errors.name?.message}
                  placeholder="이름을 입력하세요"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-stone-700">
                  이메일
                </label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-stone-50 text-stone-500"
                />
                <p className="mt-1 text-xs text-stone-500">이메일은 변경할 수 없습니다</p>
              </div>
            </div>
            </Card>
          </AnimatedSection>

          {/* Submit Button */}
          <AnimatedSection delay={0.2}>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={updateProfileMutation.isPending}
              disabled={!isDirty || updateProfileMutation.isPending}
            >
              저장하기
            </Button>
          </AnimatedSection>
        </form>
      </Page>
    </AppShell>
  )
}
