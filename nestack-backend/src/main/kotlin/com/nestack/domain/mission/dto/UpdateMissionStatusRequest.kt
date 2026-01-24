package com.nestack.domain.mission.dto

import com.nestack.common.enum.MissionStatus
import jakarta.validation.constraints.NotNull

data class UpdateMissionStatusRequest(
    @field:NotNull(message = "미션 상태는 필수입니다.")
    val status: MissionStatus
)
