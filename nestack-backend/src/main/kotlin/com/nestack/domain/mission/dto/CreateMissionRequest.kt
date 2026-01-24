package com.nestack.domain.mission.dto

import com.nestack.common.enum.MissionLevel
import com.nestack.common.enum.MissionType
import jakarta.validation.constraints.*
import java.time.LocalDate
import java.util.*

data class CreateMissionRequest(
    val templateId: UUID? = null,
    
    @field:NotNull(message = "카테고리 ID는 필수입니다.")
    val categoryId: UUID,
    
    val parentMissionId: UUID? = null,
    
    @field:NotBlank(message = "미션 이름은 필수입니다.")
    @field:Size(max = 100, message = "미션 이름은 100자 이하여야 합니다.")
    val name: String,
    
    val description: String? = null,
    
    @field:NotNull(message = "목표 금액은 필수입니다.")
    @field:Min(value = 0, message = "목표 금액은 0 이상이어야 합니다.")
    val goalAmount: java.math.BigDecimal,
    
    val missionType: MissionType? = MissionType.CUSTOM,
    
    val missionLevel: MissionLevel? = MissionLevel.MAIN,
    
    val startDate: LocalDate? = null,
    
    @field:NotNull(message = "목표일은 필수입니다.")
    val dueDate: LocalDate
)
