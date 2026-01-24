package com.nestack.domain.admin.dto

import com.nestack.common.enum.CategoryStatus

data class UpdateCategoryRequest(
    val name: String? = null,
    val displayOrder: Int? = null,
    val status: CategoryStatus? = null
)
