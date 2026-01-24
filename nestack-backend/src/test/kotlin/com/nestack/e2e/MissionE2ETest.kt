package com.nestack.e2e

import com.fasterxml.jackson.databind.ObjectMapper
import com.nestack.common.enum.AuthProvider
import com.nestack.common.enum.CategoryStatus
import com.nestack.common.enum.MissionStatus
import com.nestack.common.enum.UserStatus
import com.nestack.domain.mission.dto.CreateMissionRequest
import com.nestack.domain.mission.dto.UpdateMissionStatusRequest
import com.nestack.domain.user.service.UserService
import com.nestack.infrastructure.persistence.entity.LifeCycleCategory
import com.nestack.infrastructure.persistence.repository.LifeCycleCategoryRepository
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
import java.math.BigDecimal
import java.time.LocalDate
import java.util.*

/**
 * E2E Test: 미션 생성 -> 조회 -> 수정 -> 상태 변경 플로우
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class MissionE2ETest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var userService: UserService

    @Autowired
    private lateinit var categoryRepository: LifeCycleCategoryRepository

    @Autowired
    private lateinit var jwtTokenProvider: JwtTokenProvider

    private lateinit var userToken: String
    private lateinit var testCategory: LifeCycleCategory

    @BeforeEach
    fun setUp() {
        userRepository.deleteAll()
        categoryRepository.deleteAll()

        val user = userService.create(
            email = "test@example.com",
            password = "Test1234!@",
            name = "테스트 사용자",
            provider = AuthProvider.LOCAL
        )
        user.emailVerified = true
        user.status = UserStatus.ACTIVE
        userRepository.save(user)
        userToken = jwtTokenProvider.generateAccessToken(user.id.toString(), user.email)

        testCategory = LifeCycleCategory().apply {
            name = "결혼 준비"
            displayOrder = 1
            status = CategoryStatus.ACTIVE
        }
        categoryRepository.save(testCategory)
    }

    @Test
    fun `미션 생성 및 관리 E2E 테스트`() {
        // 1. 카테고리 조회
        mockMvc.perform(
            get("/api/v1/missions/categories")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.categories").isArray)

        // 2. 미션 생성
        val createRequest = CreateMissionRequest(
            categoryId = testCategory.id,
            name = "결혼 자금 모으기",
            description = "결혼식 비용 5천만원 목표",
            goalAmount = BigDecimal(50000000),
            dueDate = LocalDate.now().plusYears(1)
        )

        val createResponse = mockMvc.perform(
            post("/api/v1/missions")
                .header("Authorization", "Bearer $userToken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.mission.name").value("결혼 자금 모으기"))
            .andReturn()

        val missionId = objectMapper.readTree(createResponse.response.contentAsString)
            .get("data").get("mission").get("id").asText()

        // 3. 미션 목록 조회
        mockMvc.perform(
            get("/api/v1/missions")
                .header("Authorization", "Bearer $userToken")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.missions").isArray)

        // 4. 미션 상세 조회
        mockMvc.perform(
            get("/api/v1/missions/$missionId")
                .header("Authorization", "Bearer $userToken")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.mission.id").value(missionId))

        // 5. 미션 상태 변경
        val statusRequest = UpdateMissionStatusRequest(status = MissionStatus.IN_PROGRESS)

        mockMvc.perform(
            patch("/api/v1/missions/$missionId/status")
                .header("Authorization", "Bearer $userToken")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusRequest))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.mission.status").value("IN_PROGRESS"))

        // 6. 진행 요약 조회
        mockMvc.perform(
            get("/api/v1/missions/summary")
                .header("Authorization", "Bearer $userToken")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.summary.totalMissions").exists())
    }
}
