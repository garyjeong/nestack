package com.nestack.domain.admin

import com.nestack.common.enum.AdminRole
import com.nestack.common.enum.AdminStatus
import com.nestack.common.enum.AuthProvider
import com.nestack.common.util.CryptoUtil
import com.nestack.domain.admin.dto.AdminLoginRequest
import com.nestack.domain.admin.service.AdminService
import com.nestack.infrastructure.persistence.entity.AdminUser
import com.nestack.infrastructure.persistence.repository.AdminUserRepository
import com.nestack.infrastructure.persistence.repository.UserRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AdminServiceTest {

    @Autowired
    private lateinit var adminService: AdminService

    @Autowired
    private lateinit var adminUserRepository: AdminUserRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    @BeforeEach
    fun setUp() {
        adminUserRepository.deleteAll()
        userRepository.deleteAll()
    }

    @Test
    fun `관리자 로그인 성공`() {
        val admin = AdminUser().apply {
            email = "admin@example.com"
            passwordHash = CryptoUtil.hashPassword("Admin1234!@")
            name = "관리자"
            role = AdminRole.ADMIN
            status = AdminStatus.ACTIVE
        }
        adminUserRepository.save(admin)

        val loginRequest = AdminLoginRequest(
            email = "admin@example.com",
            password = "Admin1234!@"
        )

        val response = adminService.login(loginRequest)

        assertNotNull(response.accessToken)
        assertEquals("admin@example.com", response.admin.email)
        assertEquals(AdminRole.ADMIN, response.admin.role)
    }

    @Test
    fun `관리자 로그인 실패 - 잘못된 비밀번호`() {
        val admin = AdminUser().apply {
            email = "admin@example.com"
            passwordHash = CryptoUtil.hashPassword("Admin1234!@")
            name = "관리자"
            role = AdminRole.ADMIN
            status = AdminStatus.ACTIVE
        }
        adminUserRepository.save(admin)

        val loginRequest = AdminLoginRequest(
            email = "admin@example.com",
            password = "WrongPassword123!"
        )

        assertThrows(com.nestack.common.exception.BusinessException::class.java) {
            adminService.login(loginRequest)
        }
    }

    @Test
    fun `대시보드 통계 조회`() {
        // Create some test data
        val user1 = com.nestack.infrastructure.persistence.entity.User().apply {
            email = "user1@example.com"
            name = "사용자1"
            provider = AuthProvider.LOCAL
        }
        userRepository.save(user1)

        val stats = adminService.getDashboardStats()

        assertNotNull(stats)
        assertTrue(stats.totalUsers >= 1)
        assertNotNull(stats.totalFamilyGroups)
        assertNotNull(stats.totalMissions)
    }
}
