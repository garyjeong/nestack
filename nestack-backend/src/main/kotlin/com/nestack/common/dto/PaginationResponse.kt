package com.nestack.common.dto

data class PaginationResponse<T>(
    val data: List<T>,
    val meta: ApiResponse.Meta
) {
    companion object {
        fun <T> create(
            data: List<T>,
            page: Int,
            limit: Int,
            total: Long
        ): PaginationResponse<T> {
            val totalPages = ((total + limit - 1) / limit).toInt()
            
            return PaginationResponse(
                data = data,
                meta = ApiResponse.Meta(
                    timestamp = java.time.Instant.now().toString(),
                    pagination = ApiResponse.Pagination(
                        page = page,
                        limit = limit,
                        total = total,
                        totalPages = totalPages,
                        hasNext = page < totalPages,
                        hasPrev = page > 1
                    )
                )
            )
        }
    }
}
