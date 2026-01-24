package com.nestack.infrastructure.persistence

import com.nestack.common.enum.AuthProvider
import com.nestack.common.enum.CategoryStatus
import com.nestack.common.enum.UserStatus
import com.nestack.common.util.CryptoUtil
import com.nestack.infrastructure.persistence.entity.*
import com.nestack.infrastructure.persistence.repository.*
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

/**
 * Test data initializer for development/testing
 * Only runs in test profile
 */
@Component
@Profile("test")
class TestDataInitializer(
    private val userRepository: UserRepository,
    private val adminUserRepository: AdminUserRepository,
    private val categoryRepository: LifeCycleCategoryRepository,
    private val badgeRepository: BadgeRepository
) : CommandLineRunner {

    override fun run(vararg args: String?) {
        // Initialize test admin user
        if (adminUserRepository.findByEmail("admin@test.com") == null) {
            val admin = AdminUser().apply {
                email = "admin@test.com"
                passwordHash = CryptoUtil.hashPassword("Admin1234!@")
                name = "테스트 관리자"
                role = com.nestack.common.enum.AdminRole.ADMIN
                status = com.nestack.common.enum.AdminStatus.ACTIVE
            }
            adminUserRepository.save(admin)
        }

        // Initialize test categories
        if (categoryRepository.count() == 0L) {
            val categories = listOf(
                LifeCycleCategory().apply {
                    name = "결혼 준비"
                    displayOrder = 1
                    status = CategoryStatus.ACTIVE
                },
                LifeCycleCategory().apply {
                    name = "신혼"
                    displayOrder = 2
                    status = CategoryStatus.ACTIVE
                },
                LifeCycleCategory().apply {
                    name = "자녀 계획"
                    displayOrder = 3
                    status = CategoryStatus.ACTIVE
                }
            )
            categoryRepository.saveAll(categories)
        }
    }
}
