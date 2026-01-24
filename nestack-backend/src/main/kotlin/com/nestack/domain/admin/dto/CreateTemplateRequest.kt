package com.nestack.domain.admin.dto

import com.nestack.common.enum.GoalType
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.math.BigDecimal
import java.util.*

data class CreateTemplateRequest(
    @field:NotBlank(message = "템플릿 이름은 필수입니다.")
    val name: String,
    
    val description: String? = null,
    
    @field:NotNull(message = "카테고리 ID는 필수입니다.")
    val categoryId: UUID,
    
    val goalType: GoalType? = GoalType.AMOUNT,
    
    val defaultGoalAmount: BigDecimal? = null
)
