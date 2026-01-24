package com.nestack.domain.mission.dto

import jakarta.validation.constraints.*
import java.time.LocalDate

data class UpdateMissionRequest(
    @field:Size(max = 100, message = "미션 이름은 100자 이하여야 합니다.")
    val name: String? = null,
    
    val description: String? = null,
    
    @field:Min(value = 0, message = "목표 금액은 0 이상이어야 합니다.")
    val goalAmount: java.math.BigDecimal? = null,
    
    val startDate: LocalDate? = null,
    
    val dueDate: LocalDate? = null
)
