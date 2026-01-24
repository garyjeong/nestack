package com.nestack.domain.user.dto

import jakarta.validation.constraints.Size
import org.hibernate.validator.constraints.URL

data class UpdateProfileRequest(
    @field:Size(min = 1, max = 100, message = "이름은 1-100자 사이여야 합니다.")
    val name: String? = null,

    @field:URL(message = "올바른 URL 형식이 아닙니다.")
    val profileImageUrl: String? = null
)
