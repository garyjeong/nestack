package com.nestack.domain.auth.dto

import com.nestack.common.constant.PasswordRules
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

data class ResetPasswordRequest(
    @field:NotBlank
    val token: String,

    @field:NotBlank
    @field:Size(min = PasswordRules.MIN_LENGTH, message = "비밀번호는 8자 이상이어야 합니다.")
    @field:Pattern(regexp = PasswordRules.PATTERN_STRING, message = PasswordRules.MESSAGE)
    val newPassword: String
)
