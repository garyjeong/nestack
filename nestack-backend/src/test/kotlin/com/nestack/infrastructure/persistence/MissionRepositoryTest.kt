package com.nestack.infrastructure.persistence

import com.nestack.common.enum.AuthProvider
import com.nestack.common.enum.CategoryStatus
import com.nestack.common.enum.MissionLevel
import com.nestack.common.enum.MissionStatus
import com.nestack.common.enum.MissionType
import com.nestack.domain.user.service.UserService
import com.nestack.infrastructure.persistence.entity.LifeCycleCategory
import com.nestack.infrastructure.persistence.entity.Mission
import com.nestack.infrastructure.persistence.entity.User
import com.nestack.infrastructure.persistence.repository.LifeCycleCategoryRepository
import com.nestack.infrastructure.persistence.repository.MissionRepository
import com.nestack.infrastructure.persistence.repository.UserRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.test.context.ActiveProfiles
import java.math.BigDecimal
import java.time.LocalDate

@DataJpaTest
@ActiveProfiles("test")
class MissionRepositoryTest {

    @Autowired
    private lateinit var entityManager: TestEntityManager

    @Autowired
    private lateinit var missionRepository: MissionRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var categoryRepository: LifeCycleCategoryRepository

    private lateinit var testUser: User
    private lateinit var testCategory: LifeCycleCategory

    @BeforeEach
    fun setUp() {
        testUser = User().apply {
            email = "test@example.com"
            name = "테스트 사용자"
            provider = AuthProvider.LOCAL
        }
        entityManager.persistAndFlush(testUser)

        testCategory = LifeCycleCategory().apply {
            name = "결혼 준비"
            displayOrder = 1
            status = CategoryStatus.ACTIVE
        }
        entityManager.persistAndFlush(testCategory)
    }

    @Test
    fun `사용자별 미션 조회`() {
        val mission1 = Mission().apply {
            userId = testUser.id
            categoryId = testCategory.id
            name = "미션 1"
            goalAmount = BigDecimal(1000000)
            missionType = MissionType.CUSTOM
            missionLevel = MissionLevel.MAIN
            status = MissionStatus.PENDING
            dueDate = LocalDate.now().plusMonths(6)
        }
        entityManager.persistAndFlush(mission1)

        val mission2 = Mission().apply {
            userId = testUser.id
            categoryId = testCategory.id
            name = "미션 2"
            goalAmount = BigDecimal(2000000)
            missionType = MissionType.CUSTOM
            missionLevel = MissionLevel.MAIN
            status = MissionStatus.IN_PROGRESS
            dueDate = LocalDate.now().plusMonths(12)
        }
        entityManager.persistAndFlush(mission2)

        val missions = missionRepository.findByUserId(testUser.id)

        assertEquals(2, missions.size)
    }

    @Test
    fun `상태별 미션 조회`() {
        val mission = Mission().apply {
            userId = testUser.id
            categoryId = testCategory.id
            name = "테스트 미션"
            goalAmount = BigDecimal(1000000)
            missionType = MissionType.CUSTOM
            missionLevel = MissionLevel.MAIN
            status = MissionStatus.IN_PROGRESS
            dueDate = LocalDate.now().plusMonths(6)
        }
        entityManager.persistAndFlush(mission)

        val inProgressMissions = missionRepository.findByUserIdAndStatus(testUser.id, MissionStatus.IN_PROGRESS)

        assertEquals(1, inProgressMissions.size)
        assertEquals(MissionStatus.IN_PROGRESS, inProgressMissions.first().status)
    }
}
