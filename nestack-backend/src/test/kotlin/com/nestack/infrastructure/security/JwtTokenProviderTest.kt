package com.nestack.infrastructure.security

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import java.util.*

@SpringBootTest
@ActiveProfiles("test")
class JwtTokenProviderTest {

    @Autowired
    private lateinit var jwtTokenProvider: JwtTokenProvider

    @Test
    fun `액세스 토큰 생성 및 검증`() {
        val userId = UUID.randomUUID().toString()
        val email = "test@example.com"

        val token = jwtTokenProvider.generateAccessToken(userId, email)

        assertNotNull(token)
        assertTrue(jwtTokenProvider.validateAccessToken(token))

        val extractedUserId = jwtTokenProvider.getUserIdFromAccessToken(token)
        assertEquals(userId, extractedUserId)
    }

    @Test
    fun `리프레시 토큰 생성 및 검증`() {
        val userId = UUID.randomUUID().toString()

        val token = jwtTokenProvider.generateRefreshToken(userId)

        assertNotNull(token)
        assertTrue(jwtTokenProvider.validateRefreshToken(token))

        val extractedUserId = jwtTokenProvider.getUserIdFromRefreshToken(token)
        assertEquals(userId, extractedUserId)
    }

    @Test
    fun `잘못된 토큰 검증 실패`() {
        val invalidToken = "invalid.token.here"

        assertFalse(jwtTokenProvider.validateAccessToken(invalidToken))
        assertFalse(jwtTokenProvider.validateRefreshToken(invalidToken))
    }
}
