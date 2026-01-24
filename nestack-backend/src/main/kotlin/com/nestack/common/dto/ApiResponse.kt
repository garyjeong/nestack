package com.nestack.common.dto

import com.fasterxml.jackson.annotation.JsonInclude

@JsonInclude(JsonInclude.Include.NON_NULL)
data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val error: Error? = null,
    val meta: Meta
) {
    data class Meta(
        val timestamp: String,
        val pagination: Pagination? = null
    )

    data class Pagination(
        val page: Int,
        val limit: Int,
        val total: Long,
        val totalPages: Int,
        val hasNext: Boolean,
        val hasPrev: Boolean
    )

    data class Error(
        val code: String,
        val message: String,
        val details: Map<String, Any>? = null
    )
}

typealias ApiSuccessResponse<T> = ApiResponse<T>
typealias ApiErrorResponse = ApiResponse<Nothing>

fun <T> successResponse(data: T, pagination: ApiResponse.Pagination? = null): ApiSuccessResponse<T> {
    return ApiSuccessResponse(
        success = true,
        data = data,
        meta = ApiResponse.Meta(
            timestamp = java.time.Instant.now().toString(),
            pagination = pagination
        )
    )
}
