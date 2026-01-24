package com.nestack.domain.admin.dto

import jakarta.validation.constraints.NotNull
import java.util.*

data class IssueBadgeRequest(
    @field:NotNull(message = "사용자 ID는 필수입니다.")
    val userId: UUID,
    
    @field:NotNull(message = "뱃지 ID는 필수입니다.")
    val badgeId: UUID
)
