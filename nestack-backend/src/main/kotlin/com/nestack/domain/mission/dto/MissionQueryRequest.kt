package com.nestack.domain.mission.dto

import com.nestack.common.enum.MissionLevel
import com.nestack.common.enum.MissionStatus
import java.util.*

data class MissionQueryRequest(
    val status: MissionStatus? = null,
    val level: MissionLevel? = null,
    val categoryId: UUID? = null,
    val parentMissionId: UUID? = null
)
