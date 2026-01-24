package com.nestack.common.exception

import com.nestack.common.constant.ErrorCode
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class GlobalExceptionHandlerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Test
    fun `BusinessException 처리`() {
        // This will trigger a BusinessException
        mockMvc.perform(
            get("/api/v1/users/me")
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `잘못된 요청 형식 처리`() {
        val invalidRequest = mapOf(
            "email" to "invalid-email", // Invalid email format
            "password" to "123" // Too short
        )

        mockMvc.perform(
            post("/api/v1/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(invalidRequest))
        )
            .andExpect(status().isBadRequest)
    }
}
