package com.nestack.domain.admin.dto

import com.nestack.common.enum.UserStatus
import jakarta.validation.constraints.NotNull

data class UpdateUserStatusRequest(
    @field:NotNull
    val status: UserStatus
)
