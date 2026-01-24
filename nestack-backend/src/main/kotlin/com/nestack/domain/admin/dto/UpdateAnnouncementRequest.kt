package com.nestack.domain.admin.dto

import com.nestack.common.enum.AnnouncementStatus
import com.nestack.common.enum.DisplayType
import java.time.LocalDateTime

data class UpdateAnnouncementRequest(
    val title: String? = null,
    val content: String? = null,
    val displayType: DisplayType? = null,
    val startDate: LocalDateTime? = null,
    val endDate: LocalDateTime? = null,
    val status: AnnouncementStatus? = null
)
