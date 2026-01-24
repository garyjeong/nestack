package com.nestack.infrastructure.persistence

import com.nestack.common.enum.AuthProvider
import com.nestack.common.enum.UserStatus
import com.nestack.domain.user.service.UserService
import com.nestack.infrastructure.persistence.entity.User
import com.nestack.infrastructure.persistence.repository.UserRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.test.context.ActiveProfiles

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private lateinit var entityManager: TestEntityManager

    @Autowired
    private lateinit var userRepository: UserRepository

    @Test
    fun `이메일로 사용자 조회`() {
        val user = User().apply {
            email = "test@example.com"
            name = "테스트 사용자"
            provider = AuthProvider.LOCAL
            status = UserStatus.ACTIVE
        }
        entityManager.persistAndFlush(user)

        val found = userRepository.findByEmail("test@example.com")

        assertNotNull(found)
        assertEquals("test@example.com", found?.email)
    }

    @Test
    fun `프로바이더로 사용자 조회`() {
        val user = User().apply {
            email = "test@example.com"
            name = "테스트 사용자"
            provider = AuthProvider.GOOGLE
            providerId = "google123"
            status = UserStatus.ACTIVE
        }
        entityManager.persistAndFlush(user)

        val found = userRepository.findByProviderAndProviderId(AuthProvider.GOOGLE, "google123")

        assertNotNull(found)
        assertEquals("google123", found?.providerId)
    }
}
