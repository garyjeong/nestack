import { z } from 'zod'

export const createMissionSchema = z.object({
  categoryId: z.string().min(1, '카테고리를 선택해주세요'),
  templateId: z.string().optional(),
  parentMissionId: z.string().optional(),
  name: z
    .string()
    .min(1, '미션 이름을 입력해주세요')
    .max(100, '미션 이름은 100자 이하여야 합니다'),
  description: z
    .string()
    .max(500, '설명은 500자 이하여야 합니다')
    .optional(),
  type: z.enum(['main', 'monthly', 'weekly', 'daily'], {
    message: '미션 유형을 선택해주세요',
  }),
  targetAmount: z
    .number({ message: '목표 금액을 입력해주세요' })
    .min(1000, '목표 금액은 1,000원 이상이어야 합니다')
    .max(10000000000, '목표 금액은 100억원 이하여야 합니다'),
  startDate: z.string().min(1, '시작일을 선택해주세요'),
  endDate: z.string().min(1, '종료일을 선택해주세요'),
}).refine(
  (data) => {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    return end > start
  },
  {
    message: '종료일은 시작일보다 이후여야 합니다',
    path: ['endDate'],
  }
)

export const updateMissionSchema = z.object({
  name: z
    .string()
    .min(1, '미션 이름을 입력해주세요')
    .max(100, '미션 이름은 100자 이하여야 합니다')
    .optional(),
  description: z
    .string()
    .max(500, '설명은 500자 이하여야 합니다')
    .optional(),
  targetAmount: z
    .number({ message: '목표 금액을 입력해주세요' })
    .min(1000, '목표 금액은 1,000원 이상이어야 합니다')
    .max(10000000000, '목표 금액은 100억원 이하여야 합니다')
    .optional(),
  endDate: z.string().optional(),
})

export type CreateMissionFormData = z.infer<typeof createMissionSchema>
export type UpdateMissionFormData = z.infer<typeof updateMissionSchema>
