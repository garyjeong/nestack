package com.nestack.common.constant

object SystemSettings {
    const val INVITE_CODE_EXPIRY_DAYS = "invite_code_expiry_days"
    const val INVITE_CODE_LENGTH = "invite_code_length"
    const val MAX_FAMILY_MEMBERS = "max_family_members"
    const val DEFAULT_SHARE_STATUS = "default_share_status"
}

object Defaults {
    const val INVITE_CODE_EXPIRY_DAYS = 7
    const val INVITE_CODE_LENGTH = 12
    const val MAX_FAMILY_MEMBERS = 2
    const val DEFAULT_SHARE_STATUS = "private"
    const val PAGINATION_LIMIT = 20
    const val MAX_PAGINATION_LIMIT = 100
}

object PasswordRules {
    const val MIN_LENGTH = 8
    const val PATTERN_STRING = "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[!@#\$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).{8,}\$"
    const val MESSAGE = "비밀번호는 8자 이상, 영문/숫자/특수문자 조합이어야 합니다."
}
