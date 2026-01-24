package com.nestack.common.constant

enum class ErrorCode(
    val code: String,
    val message: String,
    val status: Int
) {
    // Authentication Errors (AUTH_XXX)
    AUTH_001("AUTH_001", "인증 토큰이 만료되었습니다.", 401),
    AUTH_002("AUTH_002", "유효하지 않은 인증 토큰입니다.", 401),
    AUTH_003("AUTH_003", "인증 토큰이 필요합니다.", 401),
    AUTH_004("AUTH_004", "이메일 또는 비밀번호가 일치하지 않습니다.", 401),
    AUTH_005("AUTH_005", "이메일 인증이 필요합니다.", 401),
    AUTH_006("AUTH_006", "비활성화된 계정입니다.", 403),
    AUTH_007("AUTH_007", "탈퇴한 계정입니다.", 403),

    // User Errors (USER_XXX)
    USER_001("USER_001", "이미 사용 중인 이메일입니다.", 400),
    USER_002("USER_002", "비밀번호 규칙에 맞지 않습니다.", 400),
    USER_003("USER_003", "사용자를 찾을 수 없습니다.", 404),
    USER_004("USER_004", "현재 비밀번호가 일치하지 않습니다.", 400),
    USER_005("USER_005", "인증 토큰이 만료되었습니다.", 400),

    // Family Group Errors (FAMILY_XXX)
    FAMILY_001("FAMILY_001", "이미 가족 그룹에 속해 있습니다.", 400),
    FAMILY_002("FAMILY_002", "유효하지 않은 초대 코드입니다.", 400),
    FAMILY_003("FAMILY_003", "만료된 초대 코드입니다.", 400),
    FAMILY_004("FAMILY_004", "이미 사용된 초대 코드입니다.", 400),
    FAMILY_005("FAMILY_005", "가족 그룹 최대 인원을 초과했습니다.", 400),
    FAMILY_006("FAMILY_006", "가족 그룹을 찾을 수 없습니다.", 404),
    FAMILY_007("FAMILY_007", "가족 그룹에 대한 권한이 없습니다.", 403),

    // Mission Errors (MISSION_XXX)
    MISSION_001("MISSION_001", "유효하지 않은 카테고리입니다.", 400),
    MISSION_002("MISSION_002", "유효하지 않은 템플릿입니다.", 400),
    MISSION_003("MISSION_003", "유효하지 않은 상위 미션입니다.", 400),
    MISSION_004("MISSION_004", "미션을 찾을 수 없습니다.", 404),
    MISSION_005("MISSION_005", "완료된 미션은 수정할 수 없습니다.", 400),
    MISSION_006("MISSION_006", "유효하지 않은 상태 전환입니다.", 400),
    MISSION_007("MISSION_007", "일부 거래를 찾을 수 없습니다.", 404),

    // Finance Errors (FINANCE_XXX)
    FINANCE_001("FINANCE_001", "오픈뱅킹 연동에 실패했습니다.", 400),
    FINANCE_002("FINANCE_002", "오픈뱅킹 토큰이 만료되었습니다.", 400),
    FINANCE_003("FINANCE_003", "계좌를 찾을 수 없습니다.", 404),
    FINANCE_004("FINANCE_004", "계좌에 대한 권한이 없습니다.", 403),
    FINANCE_005("FINANCE_005", "계좌 동기화에 실패했습니다.", 400),
    FINANCE_006("FINANCE_006", "거래 내역을 찾을 수 없습니다.", 404),

    // Badge Errors (BADGE_XXX)
    BADGE_001("BADGE_001", "뱃지를 찾을 수 없습니다.", 404),
    BADGE_002("BADGE_002", "이미 획득한 뱃지입니다.", 400),
    BADGE_003("BADGE_003", "뱃지에 대한 권한이 없습니다.", 403),

    // Common Errors (COMMON_XXX)
    COMMON_001("COMMON_001", "잘못된 요청입니다.", 400),
    COMMON_002("COMMON_002", "필수 파라미터가 누락되었습니다.", 400),
    COMMON_003("COMMON_003", "서버 내부 오류가 발생했습니다.", 500),
    COMMON_004("COMMON_004", "요청이 너무 많습니다.", 429),

    // Admin Errors (ADMIN_XXX)
    ADMIN_001("ADMIN_001", "어드민 권한이 필요합니다.", 403),
    ADMIN_002("ADMIN_002", "슈퍼 어드민 권한이 필요합니다.", 403),
    ADMIN_003("ADMIN_003", "어드민 계정을 찾을 수 없습니다.", 404),
    ADMIN_004("ADMIN_004", "이미 존재하는 어드민 이메일입니다.", 400),
    ADMIN_005("ADMIN_005", "자기 자신의 계정은 삭제할 수 없습니다.", 400),
    ADMIN_006("ADMIN_006", "마지막 슈퍼 어드민은 삭제할 수 없습니다.", 400),
    ADMIN_007("ADMIN_007", "유효하지 않은 어드민 역할입니다.", 400)
}
