package com.nestack.domain.auth.dto

import com.nestack.common.constant.PasswordRules
import jakarta.validation.constraints.*

data class SignupRequest(
    @field:Email(message = "올바른 이메일 형식이 아닙니다.")
    val email: String,

    @field:NotBlank
    @field:Size(min = PasswordRules.MIN_LENGTH, message = "비밀번호는 8자 이상이어야 합니다.")
    @field:Pattern(regexp = PasswordRules.PATTERN_STRING, message = PasswordRules.MESSAGE)
    val password: String,

    @field:NotBlank(message = "이름을 입력해주세요.")
    @field:Size(max = 100, message = "이름은 100자 이내로 입력해주세요.")
    val name: String,

    @field:NotNull(message = "이용약관에 동의해주세요.")
    val termsAgreed: Boolean,

    @field:NotNull(message = "개인정보 처리방침에 동의해주세요.")
    val privacyAgreed: Boolean
)
