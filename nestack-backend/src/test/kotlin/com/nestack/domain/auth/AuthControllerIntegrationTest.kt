package com.nestack.domain.auth

import com.fasterxml.jackson.databind.ObjectMapper
import com.nestack.common.enum.AuthProvider
import com.nestack.common.enum.UserStatus
import com.nestack.domain.auth.dto.SignupRequest
import com.nestack.domain.user.service.UserService
import com.nestack.infrastructure.persistence.entity.User
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

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerIntegrationTest {

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
    fun `회원가입 성공`() {
        val signupRequest = SignupRequest(
            email = "test@example.com",
            password = "Test1234!@",
            name = "테스트 사용자",
            termsAgreed = true,
            privacyAgreed = true
        )

        mockMvc.perform(
            post("/api/v1/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.user.email").value("test@example.com"))
            .andExpect(jsonPath("$.data.message").exists())
    }

    @Test
    fun `회원가입 실패 - 약관 미동의`() {
        val signupRequest = SignupRequest(
            email = "test@example.com",
            password = "Test1234!@",
            name = "테스트 사용자",
            termsAgreed = false,
            privacyAgreed = true
        )

        mockMvc.perform(
            post("/api/v1/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest))
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `로그인 성공`() {
        // Create user
        val user = userService.create(
            email = "test@example.com",
            password = "Test1234!@",
            name = "테스트 사용자",
            provider = AuthProvider.LOCAL
        )
        user.emailVerified = true
        user.status = UserStatus.ACTIVE
        userRepository.save(user)

        val loginRequest = mapOf(
            "email" to "test@example.com",
            "password" to "Test1234!@"
        )

        mockMvc.perform(
            post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.user.email").value("test@example.com"))
            .andExpect(jsonPath("$.data.tokens.accessToken").exists())
            .andExpect(jsonPath("$.data.tokens.refreshToken").exists())
    }

    @Test
    fun `로그인 실패 - 잘못된 비밀번호`() {
        val user = userService.create(
            email = "test@example.com",
            password = "Test1234!@",
            name = "테스트 사용자",
            provider = AuthProvider.LOCAL
        )
        user.emailVerified = true
        user.status = UserStatus.ACTIVE
        userRepository.save(user)

        val loginRequest = mapOf(
            "email" to "test@example.com",
            "password" to "WrongPassword123!"
        )

        mockMvc.perform(
            post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest))
        )
            .andExpect(status().isUnauthorized)
    }
}
