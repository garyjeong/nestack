package com.nestack.domain.mission

import com.nestack.common.enum.AuthProvider
import com.nestack.common.enum.CategoryStatus
import com.nestack.common.enum.MissionLevel
import com.nestack.common.enum.MissionStatus
import com.nestack.common.enum.MissionType
import com.nestack.domain.mission.dto.CreateMissionRequest
import com.nestack.domain.mission.service.MissionService
import com.nestack.domain.user.service.UserService
import com.nestack.infrastructure.persistence.entity.LifeCycleCategory
import com.nestack.infrastructure.persistence.repository.LifeCycleCategoryRepository
import com.nestack.infrastructure.persistence.repository.MissionRepository
import com.nestack.infrastructure.persistence.repository.UserRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate
import java.util.*

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MissionServiceTest {

    @Autowired
    private lateinit var missionService: MissionService

    @Autowired
    private lateinit var userService: UserService

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var categoryRepository: LifeCycleCategoryRepository

    @Autowired
    private lateinit var missionRepository: MissionRepository

    private lateinit var testUser: com.nestack.infrastructure.persistence.entity.User
    private lateinit var testCategory: LifeCycleCategory

    @BeforeEach
    fun setUp() {
        missionRepository.deleteAll()
        categoryRepository.deleteAll()
        userRepository.deleteAll()

        testUser = userService.create(
            email = "test@example.com",
            password = "Test1234!@",
            name = "테스트 사용자",
            provider = AuthProvider.LOCAL
        )

        testCategory = LifeCycleCategory().apply {
            name = "결혼 준비"
            displayOrder = 1
            status = CategoryStatus.ACTIVE
        }
        categoryRepository.save(testCategory)
    }

    @Test
    fun `미션 생성 성공`() {
        val request = CreateMissionRequest(
            categoryId = testCategory.id,
            name = "결혼 자금 모으기",
            description = "결혼식 비용 5천만원 목표",
            goalAmount = BigDecimal(50000000),
            missionType = MissionType.CUSTOM,
            missionLevel = MissionLevel.MAIN,
            dueDate = LocalDate.now().plusYears(1)
        )

        val mission = missionService.create(testUser.id, request, null)

        assertNotNull(mission.id)
        assertEquals("결혼 자금 모으기", mission.name)
        assertEquals(BigDecimal(50000000), mission.goalAmount)
        assertEquals(MissionStatus.PENDING, mission.status)
        assertEquals(MissionLevel.MAIN, mission.missionLevel)
    }

    @Test
    fun `미션 목록 조회`() {
        val request1 = CreateMissionRequest(
            categoryId = testCategory.id,
            name = "미션 1",
            goalAmount = BigDecimal(1000000),
            dueDate = LocalDate.now().plusMonths(6)
        )

        val request2 = CreateMissionRequest(
            categoryId = testCategory.id,
            name = "미션 2",
            goalAmount = BigDecimal(2000000),
            dueDate = LocalDate.now().plusMonths(12)
        )

        missionService.create(testUser.id, request1, null)
        missionService.create(testUser.id, request2, null)

        val missions = missionService.findAll(
            userId = testUser.id,
            query = com.nestack.domain.mission.dto.MissionQueryRequest(),
            familyGroupId = null
        )

        assertEquals(2, missions.size)
    }

    @Test
    fun `미션 상태 변경`() {
        val request = CreateMissionRequest(
            categoryId = testCategory.id,
            name = "테스트 미션",
            goalAmount = BigDecimal(1000000),
            dueDate = LocalDate.now().plusMonths(6)
        )

        val mission = missionService.create(testUser.id, request, null)
        assertEquals(MissionStatus.PENDING, mission.status)

        val updatedMission = missionService.updateStatus(
            missionId = mission.id,
            userId = testUser.id,
            request = com.nestack.domain.mission.dto.UpdateMissionStatusRequest(
                status = MissionStatus.IN_PROGRESS
            )
        )

        assertEquals(MissionStatus.IN_PROGRESS, updatedMission.status)
    }
}
