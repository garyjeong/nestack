package com.nestack.domain.user

import com.nestack.common.constant.ErrorCode
import com.nestack.common.enum.AuthProvider
import com.nestack.common.enum.UserStatus
import com.nestack.common.exception.BusinessException
import com.nestack.domain.user.service.UserService
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
class UserServiceTest {

    @Autowired
    private lateinit var userService: UserService

    @Autowired
    private lateinit var userRepository: UserRepository

    @BeforeEach
    fun setUp() {
        userRepository.deleteAll()
    }

    @Test
    fun `사용자 생성 성공`() {
        val user = userService.create(
            email = "test@example.com",
            password = "Test1234!@",
            name = "테스트 사용자",
            provider = AuthProvider.LOCAL
        )

        assertNotNull(user.id)
        assertEquals("test@example.com", user.email)
        assertEquals("테스트 사용자", user.name)
        assertEquals(AuthProvider.LOCAL, user.provider)
        assertNotNull(user.passwordHash)
    }

    @Test
    fun `사용자 생성 실패 - 중복 이메일`() {
        userService.create(
            email = "test@example.com",
            password = "Test1234!@",
            name = "테스트 사용자",
            provider = AuthProvider.LOCAL
        )

        assertThrows(BusinessException::class.java) {
            userService.create(
                email = "test@example.com",
                password = "Test1234!@",
                name = "다른 사용자",
                provider = AuthProvider.LOCAL
            )
        }
    }

    @Test
    fun `이메일로 사용자 조회`() {
        val createdUser = userService.create(
            email = "test@example.com",
            password = "Test1234!@",
            name = "테스트 사용자",
            provider = AuthProvider.LOCAL
        )

        val foundUser = userService.findByEmail("test@example.com")

        assertNotNull(foundUser)
        assertEquals(createdUser.id, foundUser?.id)
        assertEquals("test@example.com", foundUser?.email)
    }

    @Test
    fun `프로필 업데이트`() {
        val user = userService.create(
            email = "test@example.com",
            password = "Test1234!@",
            name = "테스트 사용자",
            provider = AuthProvider.LOCAL
        )

        val updatedUser = userService.updateProfile(
            userId = user.id,
            name = "수정된 이름",
            profileImageUrl = "https://example.com/profile.jpg"
        )

        assertEquals("수정된 이름", updatedUser.name)
        assertEquals("https://example.com/profile.jpg", updatedUser.profileImageUrl)
    }

    @Test
    fun `비밀번호 변경 성공`() {
        val user = userService.create(
            email = "test@example.com",
            password = "Test1234!@",
            name = "테스트 사용자",
            provider = AuthProvider.LOCAL
        )

        assertDoesNotThrow {
            userService.changePassword(
                userId = user.id,
                currentPassword = "Test1234!@",
                newPassword = "NewPassword123!"
            )
        }

        val updatedUser = userService.findById(user.id)
        assertNotNull(updatedUser)
        // Verify new password works
        val canLogin = com.nestack.common.util.CryptoUtil.verifyPassword(
            "NewPassword123!",
            updatedUser!!.passwordHash!!
        )
        assertTrue(canLogin)
    }

    @Test
    fun `비밀번호 변경 실패 - 잘못된 현재 비밀번호`() {
        val user = userService.create(
            email = "test@example.com",
            password = "Test1234!@",
            name = "테스트 사용자",
            provider = AuthProvider.LOCAL
        )

        assertThrows(BusinessException::class.java) {
            userService.changePassword(
                userId = user.id,
                currentPassword = "WrongPassword123!",
                newPassword = "NewPassword123!"
            )
        }
    }
}
