package com.nestack.domain.admin.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class AdminLoginRequest(
    @field:Email(message = "올바른 이메일 형식이 아닙니다.")
    val email: String,

    @field:NotBlank
    @field:Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다.")
    val password: String
)
