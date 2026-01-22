export const ErrorCodes = {
  // Authentication Errors (AUTH_XXX)
  AUTH_001: { code: 'AUTH_001', message: '인증 토큰이 만료되었습니다.', status: 401 },
  AUTH_002: { code: 'AUTH_002', message: '유효하지 않은 인증 토큰입니다.', status: 401 },
  AUTH_003: { code: 'AUTH_003', message: '인증 토큰이 필요합니다.', status: 401 },
  AUTH_004: { code: 'AUTH_004', message: '이메일 또는 비밀번호가 일치하지 않습니다.', status: 401 },
  AUTH_005: { code: 'AUTH_005', message: '이메일 인증이 필요합니다.', status: 401 },
  AUTH_006: { code: 'AUTH_006', message: '비활성화된 계정입니다.', status: 403 },
  AUTH_007: { code: 'AUTH_007', message: '탈퇴한 계정입니다.', status: 403 },

  // User Errors (USER_XXX)
  USER_001: { code: 'USER_001', message: '이미 사용 중인 이메일입니다.', status: 400 },
  USER_002: { code: 'USER_002', message: '비밀번호 규칙에 맞지 않습니다.', status: 400 },
  USER_003: { code: 'USER_003', message: '사용자를 찾을 수 없습니다.', status: 404 },
  USER_004: { code: 'USER_004', message: '현재 비밀번호가 일치하지 않습니다.', status: 400 },
  USER_005: { code: 'USER_005', message: '인증 토큰이 만료되었습니다.', status: 400 },

  // Family Group Errors (FAMILY_XXX)
  FAMILY_001: { code: 'FAMILY_001', message: '이미 가족 그룹에 속해 있습니다.', status: 400 },
  FAMILY_002: { code: 'FAMILY_002', message: '유효하지 않은 초대 코드입니다.', status: 400 },
  FAMILY_003: { code: 'FAMILY_003', message: '만료된 초대 코드입니다.', status: 400 },
  FAMILY_004: { code: 'FAMILY_004', message: '이미 사용된 초대 코드입니다.', status: 400 },
  FAMILY_005: { code: 'FAMILY_005', message: '가족 그룹 최대 인원을 초과했습니다.', status: 400 },
  FAMILY_006: { code: 'FAMILY_006', message: '가족 그룹을 찾을 수 없습니다.', status: 404 },
  FAMILY_007: { code: 'FAMILY_007', message: '가족 그룹에 대한 권한이 없습니다.', status: 403 },

  // Mission Errors (MISSION_XXX)
  MISSION_001: { code: 'MISSION_001', message: '유효하지 않은 카테고리입니다.', status: 400 },
  MISSION_002: { code: 'MISSION_002', message: '유효하지 않은 템플릿입니다.', status: 400 },
  MISSION_003: { code: 'MISSION_003', message: '유효하지 않은 상위 미션입니다.', status: 400 },
  MISSION_004: { code: 'MISSION_004', message: '미션을 찾을 수 없습니다.', status: 404 },
  MISSION_005: { code: 'MISSION_005', message: '완료된 미션은 수정할 수 없습니다.', status: 400 },
  MISSION_006: { code: 'MISSION_006', message: '유효하지 않은 상태 전환입니다.', status: 400 },
  MISSION_007: { code: 'MISSION_007', message: '일부 거래를 찾을 수 없습니다.', status: 404 },

  // Finance Errors (FINANCE_XXX)
  FINANCE_001: { code: 'FINANCE_001', message: '오픈뱅킹 연동에 실패했습니다.', status: 400 },
  FINANCE_002: { code: 'FINANCE_002', message: '오픈뱅킹 토큰이 만료되었습니다.', status: 400 },
  FINANCE_003: { code: 'FINANCE_003', message: '계좌를 찾을 수 없습니다.', status: 404 },
  FINANCE_004: { code: 'FINANCE_004', message: '계좌에 대한 권한이 없습니다.', status: 403 },
  FINANCE_005: { code: 'FINANCE_005', message: '계좌 동기화에 실패했습니다.', status: 400 },
  FINANCE_006: { code: 'FINANCE_006', message: '거래 내역을 찾을 수 없습니다.', status: 404 },

  // Badge Errors (BADGE_XXX)
  BADGE_001: { code: 'BADGE_001', message: '뱃지를 찾을 수 없습니다.', status: 404 },
  BADGE_002: { code: 'BADGE_002', message: '이미 획득한 뱃지입니다.', status: 400 },
  BADGE_003: { code: 'BADGE_003', message: '뱃지에 대한 권한이 없습니다.', status: 403 },

  // Common Errors (COMMON_XXX)
  COMMON_001: { code: 'COMMON_001', message: '잘못된 요청입니다.', status: 400 },
  COMMON_002: { code: 'COMMON_002', message: '필수 파라미터가 누락되었습니다.', status: 400 },
  COMMON_003: { code: 'COMMON_003', message: '서버 내부 오류가 발생했습니다.', status: 500 },
  COMMON_004: { code: 'COMMON_004', message: '요청이 너무 많습니다.', status: 429 },

  // Admin Errors (ADMIN_XXX)
  ADMIN_001: { code: 'ADMIN_001', message: '어드민 권한이 필요합니다.', status: 403 },
  ADMIN_002: { code: 'ADMIN_002', message: '슈퍼 어드민 권한이 필요합니다.', status: 403 },
  ADMIN_003: { code: 'ADMIN_003', message: '어드민 계정을 찾을 수 없습니다.', status: 404 },
  ADMIN_004: { code: 'ADMIN_004', message: '이미 존재하는 어드민 이메일입니다.', status: 400 },
  ADMIN_005: { code: 'ADMIN_005', message: '자기 자신의 계정은 삭제할 수 없습니다.', status: 400 },
  ADMIN_006: { code: 'ADMIN_006', message: '마지막 슈퍼 어드민은 삭제할 수 없습니다.', status: 400 },
  ADMIN_007: { code: 'ADMIN_007', message: '유효하지 않은 어드민 역할입니다.', status: 400 },
} as const;

export type ErrorCodeKey = keyof typeof ErrorCodes;
