package com.nestack.e2e

import com.fasterxml.jackson.databind.ObjectMapper
import com.nestack.common.enum.AuthProvider
import com.nestack.common.enum.UserStatus
import com.nestack.domain.auth.dto.SignupRequest
import com.nestack.domain.family.dto.JoinFamilyRequest
import com.nestack.domain.user.service.UserService
import com.nestack.infrastructure.persistence.repository.UserRepository
import com.nestack.infrastructure.security.JwtTokenProvider
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
 * E2E Test: 가족 그룹 생성 -> 초대 코드 발급 -> 가입 플로우
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class FamilyE2ETest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var userService: UserService

    @Autowired
    private lateinit var jwtTokenProvider: JwtTokenProvider

    private lateinit var user1Token: String
    private lateinit var user2Token: String

    @BeforeEach
    fun setUp() {
        userRepository.deleteAll()

        // Create user1
        val user1 = userService.create(
            email = "user1@example.com",
            password = "Test1234!@",
            name = "사용자1",
            provider = AuthProvider.LOCAL
        )
        user1.emailVerified = true
        user1.status = UserStatus.ACTIVE
        userRepository.save(user1)
        user1Token = jwtTokenProvider.generateAccessToken(user1.id.toString(), user1.email)

        // Create user2
        val user2 = userService.create(
            email = "user2@example.com",
            password = "Test1234!@",
            name = "사용자2",
            provider = AuthProvider.LOCAL
        )
        user2.emailVerified = true
        user2.status = UserStatus.ACTIVE
        userRepository.save(user2)
        user2Token = jwtTokenProvider.generateAccessToken(user2.id.toString(), user2.email)
    }

    @Test
    fun `가족 그룹 생성 및 가입 E2E 테스트`() {
        // 1. User1이 가족 그룹 생성
        val createResponse = mockMvc.perform(
            post("/api/v1/family/create")
                .header("Authorization", "Bearer $user1Token")
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.familyGroup.id").exists())
            .andExpect(jsonPath("$.data.inviteCode").exists())
            .andReturn()

        val inviteCode = objectMapper.readTree(createResponse.response.contentAsString)
            .get("data").get("inviteCode").asText()

        // 2. User1이 초대 코드 조회
        mockMvc.perform(
            get("/api/v1/family/invite-code")
                .header("Authorization", "Bearer $user1Token")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.inviteCode").value(inviteCode))

        // 3. User2가 초대 코드로 가입
        val joinRequest = JoinFamilyRequest(inviteCode = inviteCode)

        mockMvc.perform(
            post("/api/v1/family/join")
                .header("Authorization", "Bearer $user2Token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(joinRequest))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.familyGroup.memberCount").value(2))

        // 4. User1이 가족 정보 조회 (파트너 정보 포함)
        mockMvc.perform(
            get("/api/v1/family")
                .header("Authorization", "Bearer $user1Token")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.hasFamily").value(true))
            .andExpect(jsonPath("$.data.partner").exists())
            .andExpect(jsonPath("$.data.partner.name").value("사용자2"))
    }
}
