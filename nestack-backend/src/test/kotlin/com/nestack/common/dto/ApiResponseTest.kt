package com.nestack.common.dto

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class ApiResponseTest {

    @Test
    fun `성공 응답 생성`() {
        val data = mapOf("message" to "Success")
        val response = successResponse(data)

        assertTrue(response.success)
        assertNotNull(response.data)
        assertEquals("Success", (response.data as? Map<*, *>)?.get("message"))
        assertNotNull(response.meta.timestamp)
        assertNull(response.error)
    }

    @Test
    fun `페이지네이션 포함 성공 응답`() {
        val data = listOf(1, 2, 3)
        val pagination = ApiResponse.Pagination(
            page = 1,
            limit = 10,
            total = 100,
            totalPages = 10,
            hasNext = true,
            hasPrev = false
        )

        val response = successResponse(data, pagination)

        assertTrue(response.success)
        assertNotNull(response.meta.pagination)
        assertEquals(1, response.meta.pagination?.page)
        assertEquals(100, response.meta.pagination?.total)
    }
}
