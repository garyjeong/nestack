package com.nestack.common.dto

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min

data class PaginationRequest(
    @field:Min(1)
    val page: Int = 1,
    
    @field:Min(1)
    @field:Max(100)
    val limit: Int = 20,
    
    val sort: String = "createdAt",
    
    val order: SortOrder = SortOrder.DESC
) {
    enum class SortOrder {
        ASC, DESC
    }
    
    val skip: Int
        get() = (page - 1) * limit
    
    val pageSize: Int
        get() = limit
}
