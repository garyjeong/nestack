package com.nestack.domain.auth.dto

import jakarta.validation.constraints.Email

data class ForgotPasswordRequest(
    @field:Email(message = "올바른 이메일 형식이 아닙니다.")
    val email: String
)
