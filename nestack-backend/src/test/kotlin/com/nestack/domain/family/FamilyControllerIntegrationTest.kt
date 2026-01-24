package com.nestack.domain.family

import com.fasterxml.jackson.databind.ObjectMapper
import com.nestack.common.enum.AuthProvider
import com.nestack.common.enum.UserStatus
import com.nestack.domain.auth.service.AuthService
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

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class FamilyControllerIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var userService: UserService

    @Autowired
    private lateinit var authService: AuthService

    @Autowired
    private lateinit var jwtTokenProvider: JwtTokenProvider

    private lateinit var user1Token: String
    private lateinit var user2Token: String
    private lateinit var user1: com.nestack.infrastructure.persistence.entity.User
    private lateinit var user2: com.nestack.infrastructure.persistence.entity.User

    @BeforeEach
    fun setUp() {
        userRepository.deleteAll()

        // Create user1
        user1 = userService.create(
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
        user2 = userService.create(
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
    fun `가족 그룹 생성 성공`() {
        mockMvc.perform(
            post("/api/v1/family/create")
                .header("Authorization", "Bearer $user1Token")
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.familyGroup.id").exists())
            .andExpect(jsonPath("$.data.inviteCode").exists())
    }

    @Test
    fun `초대 코드로 가족 그룹 가입 성공`() {
        // User1 creates family group
        val createResponse = mockMvc.perform(
            post("/api/v1/family/create")
                .header("Authorization", "Bearer $user1Token")
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isCreated)
            .andReturn()

        val inviteCode = objectMapper.readTree(createResponse.response.contentAsString)
            .get("data").get("inviteCode").asText()

        // User2 joins with invite code
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
    }

    @Test
    fun `가족 정보 조회`() {
        // Create family group first
        mockMvc.perform(
            post("/api/v1/family/create")
                .header("Authorization", "Bearer $user1Token")
        )

        mockMvc.perform(
            get("/api/v1/family")
                .header("Authorization", "Bearer $user1Token")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.hasFamily").value(true))
            .andExpect(jsonPath("$.data.familyGroup").exists())
    }
}
