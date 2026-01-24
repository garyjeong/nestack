package com.nestack.domain.admin.dto

import com.nestack.common.enum.BadgeType
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

data class CreateBadgeRequest(
    @field:NotBlank(message = "뱃지 이름은 필수입니다.")
    val name: String,
    
    val description: String? = null,
    
    val imageUrl: String? = null,
    
    @field:NotNull(message = "뱃지 타입은 필수입니다.")
    val badgeType: BadgeType,
    
    @field:NotBlank(message = "조건 타입은 필수입니다.")
    val conditionType: String,
    
    @field:NotNull(message = "조건 값은 필수입니다.")
    val conditionValue: Map<String, Any>
)
