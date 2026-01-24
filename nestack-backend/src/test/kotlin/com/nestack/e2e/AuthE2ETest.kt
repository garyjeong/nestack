package com.nestack.e2e

import com.fasterxml.jackson.databind.ObjectMapper
import com.nestack.common.enum.AuthProvider
import com.nestack.common.enum.UserStatus
import com.nestack.domain.auth.dto.SignupRequest
import com.nestack.domain.user.service.UserService
import com.nestack.infrastructure.persistence.repository.UserRepository
import org.junit.jupiter.api.BeforeEach
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

/**
 * E2E Test: 회원가입 -> 이메일 인증 -> 로그인 -> 프로필 조회 플로우
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthE2ETest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var userService: UserService

    @BeforeEach
    fun setUp() {
        userRepository.deleteAll()
    }

    @Test
    fun `전체 인증 플로우 E2E 테스트`() {
        // 1. 회원가입
        val signupRequest = SignupRequest(
            email = "e2e@example.com",
            password = "E2ETest1234!@",
            name = "E2E 테스트 사용자",
            termsAgreed = true,
            privacyAgreed = true
        )

        val signupResponse = mockMvc.perform(
            post("/api/v1/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.user.email").value("e2e@example.com"))
            .andReturn()

        val userId = objectMapper.readTree(signupResponse.response.contentAsString)
            .get("data").get("user").get("id").asText()

        // 2. 이메일 인증 (실제로는 토큰이 필요하지만, 테스트에서는 직접 업데이트)
        val user = userService.findById(java.util.UUID.fromString(userId))
        user?.let {
            it.emailVerified = true
            it.status = UserStatus.ACTIVE
            userRepository.save(it)
        }

        // 3. 로그인
        val loginRequest = mapOf(
            "email" to "e2e@example.com",
            "password" to "E2ETest1234!@"
        )

        val loginResponse = mockMvc.perform(
            post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.tokens.accessToken").exists())
            .andReturn()

        val accessToken = objectMapper.readTree(loginResponse.response.contentAsString)
            .get("data").get("tokens").get("accessToken").asText()

        // 4. 프로필 조회 (인증된 요청)
        mockMvc.perform(
            get("/api/v1/users/me")
                .header("Authorization", "Bearer $accessToken")
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.email").value("e2e@example.com"))
            .andExpect(jsonPath("$.data.name").value("E2E 테스트 사용자"))
    }
}
