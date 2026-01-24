package com.nestack.domain.admin.dto

import com.nestack.common.enum.CategoryStatus
import com.nestack.common.enum.GoalType
import java.math.BigDecimal
import java.util.*

data class UpdateTemplateRequest(
    val name: String? = null,
    val description: String? = null,
    val categoryId: UUID? = null,
    val goalType: GoalType? = null,
    val defaultGoalAmount: BigDecimal? = null,
    val status: CategoryStatus? = null
)
