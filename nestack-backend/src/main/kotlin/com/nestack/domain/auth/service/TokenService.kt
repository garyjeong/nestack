package com.nestack.domain.auth.service

import com.nestack.common.constant.ErrorCode
import com.nestack.common.enum.TokenType
import com.nestack.common.exception.BusinessException
import com.nestack.common.util.CryptoUtil
import com.nestack.infrastructure.persistence.entity.EmailVerificationToken
import com.nestack.infrastructure.persistence.entity.RefreshToken
import com.nestack.infrastructure.persistence.repository.EmailVerificationTokenRepository
import com.nestack.infrastructure.persistence.repository.RefreshTokenRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.*

@Service
class TokenService(
    private val refreshTokenRepository: RefreshTokenRepository,
    private val emailTokenRepository: EmailVerificationTokenRepository
) {
    @Value("\${spring.security.jwt.refresh-expiration:604800}")
    private var defaultRefreshExpiration: Long = 604800

    // ==================== Refresh Token ====================

    @Transactional
    fun createRefreshToken(
        userId: UUID,
        deviceInfo: String? = null,
        rememberMe: Boolean = false
    ): String {
        val token = CryptoUtil.generateRandomToken(32)
        val expirationDays = if (rememberMe) 30L else (defaultRefreshExpiration / 86400)
        val expiresAt = LocalDateTime.now().plusDays(expirationDays)

        val refreshToken = RefreshToken().apply {
            this.userId = userId
            this.token = token
            this.deviceInfo = deviceInfo
            this.expiresAt = expiresAt
        }

        refreshTokenRepository.save(refreshToken)
        return token
    }

    @Transactional(readOnly = true)
    fun validateRefreshToken(token: String): UUID {
        val refreshToken = refreshTokenRepository.findByToken(token)
            ?: throw BusinessException(ErrorCode.AUTH_002)

        if (refreshToken.expiresAt.isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(refreshToken)
            throw BusinessException(ErrorCode.AUTH_001)
        }

        return refreshToken.userId
    }

    @Transactional
    fun rotateRefreshToken(
        oldToken: String,
        deviceInfo: String? = null,
        rememberMe: Boolean = false
    ): String {
        val userId = validateRefreshToken(oldToken)
        deleteRefreshToken(oldToken)
        return createRefreshToken(userId, deviceInfo, rememberMe)
    }

    @Transactional
    fun deleteRefreshToken(token: String) {
        refreshTokenRepository.deleteByToken(token)
    }

    @Transactional
    fun deleteAllRefreshTokens(userId: UUID) {
        refreshTokenRepository.deleteByUserId(userId)
    }

    @Transactional
    fun cleanupExpiredRefreshTokens(): Int {
        val now = LocalDateTime.now()
        val expired = refreshTokenRepository.findAll()
            .filter { it.expiresAt.isBefore(now) }
        
        expired.forEach { refreshTokenRepository.delete(it) }
        return expired.size
    }

    // ==================== Email Verification Token ====================

    @Transactional
    fun createEmailVerificationToken(userId: UUID): String {
        // Invalidate existing tokens
        val existingTokens = emailTokenRepository.findByUserIdAndType(userId, TokenType.EMAIL_VERIFY)
            .filter { it.usedAt == null }
        existingTokens.forEach { token ->
            token.usedAt = LocalDateTime.now()
            emailTokenRepository.save(token)
        }

        val token = CryptoUtil.generateRandomToken(32)
        val expiresAt = LocalDateTime.now().plusHours(24)

        val verificationToken = EmailVerificationToken().apply {
            this.userId = userId
            this.token = token
            this.type = TokenType.EMAIL_VERIFY
            this.expiresAt = expiresAt
        }

        emailTokenRepository.save(verificationToken)
        return token
    }

    @Transactional
    fun validateEmailVerificationToken(token: String): UUID {
        val verificationToken = emailTokenRepository.findByTokenAndType(token, TokenType.EMAIL_VERIFY)
            ?: throw BusinessException(ErrorCode.USER_005)

        if (verificationToken.usedAt != null) {
            throw BusinessException(ErrorCode.USER_005)
        }

        if (verificationToken.expiresAt.isBefore(LocalDateTime.now())) {
            throw BusinessException(ErrorCode.USER_005)
        }

        // Mark as used
        verificationToken.usedAt = LocalDateTime.now()
        emailTokenRepository.save(verificationToken)

        return verificationToken.userId
    }

    // ==================== Password Reset Token ====================

    @Transactional
    fun createPasswordResetToken(userId: UUID): String {
        // Invalidate existing tokens
        val existingTokens = emailTokenRepository.findByUserIdAndType(userId, TokenType.PASSWORD_RESET)
            .filter { it.usedAt == null }
        existingTokens.forEach { token ->
            token.usedAt = LocalDateTime.now()
            emailTokenRepository.save(token)
        }

        val token = CryptoUtil.generateRandomToken(32)
        val expiresAt = LocalDateTime.now().plusHours(1)

        val resetToken = EmailVerificationToken().apply {
            this.userId = userId
            this.token = token
            this.type = TokenType.PASSWORD_RESET
            this.expiresAt = expiresAt
        }

        emailTokenRepository.save(resetToken)
        return token
    }

    @Transactional
    fun validatePasswordResetToken(token: String): UUID {
        val resetToken = emailTokenRepository.findByTokenAndType(token, TokenType.PASSWORD_RESET)
            ?: throw BusinessException(ErrorCode.USER_005)

        if (resetToken.usedAt != null) {
            throw BusinessException(ErrorCode.USER_005)
        }

        if (resetToken.expiresAt.isBefore(LocalDateTime.now())) {
            throw BusinessException(ErrorCode.USER_005)
        }

        // Mark as used
        resetToken.usedAt = LocalDateTime.now()
        emailTokenRepository.save(resetToken)

        return resetToken.userId
    }

    @Transactional
    fun cleanupExpiredEmailTokens(): Int {
        val now = LocalDateTime.now()
        val expired = emailTokenRepository.findAll()
            .filter { it.expiresAt.isBefore(now) }
        
        expired.forEach { emailTokenRepository.delete(it) }
        return expired.size
    }
}
