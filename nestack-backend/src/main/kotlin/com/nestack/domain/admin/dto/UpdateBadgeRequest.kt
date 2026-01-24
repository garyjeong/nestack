package com.nestack.domain.admin.dto

import com.nestack.common.enum.BadgeType
import com.nestack.common.enum.CategoryStatus

data class UpdateBadgeRequest(
    val name: String? = null,
    val description: String? = null,
    val imageUrl: String? = null,
    val badgeType: BadgeType? = null,
    val conditionType: String? = null,
    val conditionValue: Map<String, Any>? = null,
    val status: CategoryStatus? = null
)
