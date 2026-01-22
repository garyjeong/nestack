import { CategoryStatus, BadgeType, GoalType } from '../../common/enums';

// Lifecycle Categories Seed Data
export const lifecycleCategoriesData = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    name: '결혼자금',
    displayOrder: 1,
    status: CategoryStatus.ACTIVE,
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    name: '주택마련',
    displayOrder: 2,
    status: CategoryStatus.ACTIVE,
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    name: '출산/육아',
    displayOrder: 3,
    status: CategoryStatus.ACTIVE,
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    name: '교육자금',
    displayOrder: 4,
    status: CategoryStatus.ACTIVE,
  },
  {
    id: '11111111-1111-1111-1111-111111111105',
    name: '노후준비',
    displayOrder: 5,
    status: CategoryStatus.ACTIVE,
  },
  {
    id: '11111111-1111-1111-1111-111111111106',
    name: '비상자금',
    displayOrder: 6,
    status: CategoryStatus.ACTIVE,
  },
];

// Mission Templates Seed Data
export const missionTemplatesData = [
  // 결혼자금 템플릿
  {
    id: '22222222-2222-2222-2222-222222222201',
    name: '결혼식 비용 모으기',
    description: '결혼식에 필요한 비용을 함께 모아보세요.',
    categoryId: '11111111-1111-1111-1111-111111111101',
    goalType: GoalType.AMOUNT,
    defaultGoalAmount: 30000000,
    status: CategoryStatus.ACTIVE,
  },
  {
    id: '22222222-2222-2222-2222-222222222202',
    name: '신혼여행 자금',
    description: '꿈꾸던 신혼여행을 위한 자금을 모아보세요.',
    categoryId: '11111111-1111-1111-1111-111111111101',
    goalType: GoalType.AMOUNT,
    defaultGoalAmount: 5000000,
    status: CategoryStatus.ACTIVE,
  },
  {
    id: '22222222-2222-2222-2222-222222222203',
    name: '예물/예단 준비',
    description: '예물과 예단 비용을 준비해보세요.',
    categoryId: '11111111-1111-1111-1111-111111111101',
    goalType: GoalType.AMOUNT,
    defaultGoalAmount: 10000000,
    status: CategoryStatus.ACTIVE,
  },

  // 주택마련 템플릿
  {
    id: '22222222-2222-2222-2222-222222222211',
    name: '전세 보증금 마련',
    description: '신혼집 전세 보증금을 모아보세요.',
    categoryId: '11111111-1111-1111-1111-111111111102',
    goalType: GoalType.AMOUNT,
    defaultGoalAmount: 100000000,
    status: CategoryStatus.ACTIVE,
  },
  {
    id: '22222222-2222-2222-2222-222222222212',
    name: '내 집 마련 계약금',
    description: '내 집 마련의 첫 걸음, 계약금을 준비하세요.',
    categoryId: '11111111-1111-1111-1111-111111111102',
    goalType: GoalType.AMOUNT,
    defaultGoalAmount: 50000000,
    status: CategoryStatus.ACTIVE,
  },
  {
    id: '22222222-2222-2222-2222-222222222213',
    name: '인테리어 비용',
    description: '새 집 인테리어 비용을 모아보세요.',
    categoryId: '11111111-1111-1111-1111-111111111102',
    goalType: GoalType.AMOUNT,
    defaultGoalAmount: 20000000,
    status: CategoryStatus.ACTIVE,
  },

  // 출산/육아 템플릿
  {
    id: '22222222-2222-2222-2222-222222222221',
    name: '출산 준비금',
    description: '출산에 필요한 비용을 준비하세요.',
    categoryId: '11111111-1111-1111-1111-111111111103',
    goalType: GoalType.AMOUNT,
    defaultGoalAmount: 5000000,
    status: CategoryStatus.ACTIVE,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: '육아용품 구매',
    description: '아이를 위한 육아용품 비용을 모아보세요.',
    categoryId: '11111111-1111-1111-1111-111111111103',
    goalType: GoalType.AMOUNT,
    defaultGoalAmount: 3000000,
    status: CategoryStatus.ACTIVE,
  },
  {
    id: '22222222-2222-2222-2222-222222222223',
    name: '산후조리원 비용',
    description: '산후조리원 이용 비용을 준비하세요.',
    categoryId: '11111111-1111-1111-1111-111111111103',
    goalType: GoalType.AMOUNT,
    defaultGoalAmount: 4000000,
    status: CategoryStatus.ACTIVE,
  },

  // 교육자금 템플릿
  {
    id: '22222222-2222-2222-2222-222222222231',
    name: '자녀 학자금',
    description: '자녀의 학자금을 미리 준비하세요.',
    categoryId: '11111111-1111-1111-1111-111111111104',
    goalType: GoalType.AMOUNT,
    defaultGoalAmount: 50000000,
    status: CategoryStatus.ACTIVE,
  },
  {
    id: '22222222-2222-2222-2222-222222222232',
    name: '자기계발 비용',
    description: '함께 성장하기 위한 자기계발 비용을 모아보세요.',
    categoryId: '11111111-1111-1111-1111-111111111104',
    goalType: GoalType.AMOUNT,
    defaultGoalAmount: 5000000,
    status: CategoryStatus.ACTIVE,
  },

  // 노후준비 템플릿
  {
    id: '22222222-2222-2222-2222-222222222241',
    name: '은퇴자금 모으기',
    description: '행복한 노후를 위한 은퇴자금을 모아보세요.',
    categoryId: '11111111-1111-1111-1111-111111111105',
    goalType: GoalType.AMOUNT,
    defaultGoalAmount: 500000000,
    status: CategoryStatus.ACTIVE,
  },
  {
    id: '22222222-2222-2222-2222-222222222242',
    name: '연금저축 불입',
    description: '매월 연금저축에 불입하여 노후를 대비하세요.',
    categoryId: '11111111-1111-1111-1111-111111111105',
    goalType: GoalType.AMOUNT_COUNT,
    defaultGoalAmount: 400000,
    status: CategoryStatus.ACTIVE,
  },

  // 비상자금 템플릿
  {
    id: '22222222-2222-2222-2222-222222222251',
    name: '긴급 예비자금',
    description: '갑작스러운 상황에 대비한 예비자금을 모아보세요.',
    categoryId: '11111111-1111-1111-1111-111111111106',
    goalType: GoalType.AMOUNT,
    defaultGoalAmount: 10000000,
    status: CategoryStatus.ACTIVE,
  },
  {
    id: '22222222-2222-2222-2222-222222222252',
    name: '의료비 대비 자금',
    description: '갑작스러운 의료비에 대비한 자금을 준비하세요.',
    categoryId: '11111111-1111-1111-1111-111111111106',
    goalType: GoalType.AMOUNT,
    defaultGoalAmount: 5000000,
    status: CategoryStatus.ACTIVE,
  },
];

// Badges Seed Data
export const badgesData = [
  // Lifecycle Badges (생애주기 완료 뱃지)
  {
    id: '33333333-3333-3333-3333-333333333301',
    name: '첫 미션 완료',
    description: '첫 번째 미션을 완료했어요!',
    imageUrl: '/badges/first-mission.png',
    badgeType: BadgeType.LIFECYCLE,
    conditionType: 'mission_complete',
    conditionValue: { completed_count: 1 },
  },
  {
    id: '33333333-3333-3333-3333-333333333302',
    name: '미션 마스터',
    description: '미션 10개를 완료했어요!',
    imageUrl: '/badges/mission-master.png',
    badgeType: BadgeType.LIFECYCLE,
    conditionType: 'mission_complete',
    conditionValue: { completed_count: 10 },
  },
  {
    id: '33333333-3333-3333-3333-333333333303',
    name: '결혼 준비 완료',
    description: '결혼자금 카테고리의 미션을 모두 완료했어요!',
    imageUrl: '/badges/wedding-ready.png',
    badgeType: BadgeType.LIFECYCLE,
    conditionType: 'category_complete',
    conditionValue: { category_id: '11111111-1111-1111-1111-111111111101', completed_count: 3 },
  },
  {
    id: '33333333-3333-3333-3333-333333333304',
    name: '내 집 마련 준비',
    description: '주택마련 카테고리의 미션을 3개 완료했어요!',
    imageUrl: '/badges/home-ready.png',
    badgeType: BadgeType.LIFECYCLE,
    conditionType: 'category_complete',
    conditionValue: { category_id: '11111111-1111-1111-1111-111111111102', completed_count: 3 },
  },

  // Streak Badges (연속 완료 뱃지)
  {
    id: '33333333-3333-3333-3333-333333333311',
    name: '한 달 연속 저축',
    description: '한 달 동안 매일 저축했어요!',
    imageUrl: '/badges/streak-1month.png',
    badgeType: BadgeType.STREAK,
    conditionType: 'consecutive_days',
    conditionValue: { consecutive_days: 30 },
  },
  {
    id: '33333333-3333-3333-3333-333333333312',
    name: '3개월 연속 미션',
    description: '3개월 연속으로 미션을 수행했어요!',
    imageUrl: '/badges/streak-3months.png',
    badgeType: BadgeType.STREAK,
    conditionType: 'consecutive_months',
    conditionValue: { consecutive_months: 3 },
  },
  {
    id: '33333333-3333-3333-3333-333333333313',
    name: '1년 연속 미션',
    description: '1년 동안 꾸준히 미션을 수행했어요!',
    imageUrl: '/badges/streak-1year.png',
    badgeType: BadgeType.STREAK,
    conditionType: 'consecutive_months',
    conditionValue: { consecutive_months: 12 },
  },

  // Family Badges (가족 함께 뱃지)
  {
    id: '33333333-3333-3333-3333-333333333321',
    name: '함께하는 첫 걸음',
    description: '가족과 함께 첫 미션을 완료했어요!',
    imageUrl: '/badges/family-first.png',
    badgeType: BadgeType.FAMILY,
    conditionType: 'family_mission_complete',
    conditionValue: { family_completed_count: 1 },
  },
  {
    id: '33333333-3333-3333-3333-333333333322',
    name: '환상의 팀워크',
    description: '가족과 함께 10개의 미션을 완료했어요!',
    imageUrl: '/badges/family-teamwork.png',
    badgeType: BadgeType.FAMILY,
    conditionType: 'family_mission_complete',
    conditionValue: { family_completed_count: 10 },
  },
  {
    id: '33333333-3333-3333-3333-333333333323',
    name: '천생연분',
    description: '가족과 함께 50개의 미션을 완료했어요!',
    imageUrl: '/badges/family-soulmate.png',
    badgeType: BadgeType.FAMILY,
    conditionType: 'family_mission_complete',
    conditionValue: { family_completed_count: 50 },
  },
];

// Default Admin User
export const defaultAdminData = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@nestack.com',
  // Default password: Admin1234!@ (will be hashed)
  password: 'Admin1234!@',
  name: 'Super Admin',
  role: 'super_admin',
};
