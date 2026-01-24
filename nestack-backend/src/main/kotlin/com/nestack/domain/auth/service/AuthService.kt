package com.nestack.domain.auth.service

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier
import com.google.api.client.http.javanet.NetHttpTransport
import com.google.api.client.json.gson.GsonFactory
import com.nestack.common.constant.ErrorCode
import com.nestack.common.enum.AuthProvider
import com.nestack.common.enum.UserStatus
import com.nestack.common.exception.BusinessException
import com.nestack.common.util.CryptoUtil
import com.nestack.domain.auth.dto.*
import com.nestack.domain.user.service.UserService
import com.nestack.infrastructure.external.mail.MailService
import com.nestack.infrastructure.persistence.entity.User
import com.nestack.infrastructure.security.JwtTokenProvider
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Service
class AuthService(
    private val userService: UserService,
    private val tokenService: TokenService,
    private val mailService: MailService,
    private val jwtTokenProvider: JwtTokenProvider
) {
    private val logger = LoggerFactory.getLogger(AuthService::class.java)

    @Value("\${spring.google.client-id}")
    private lateinit var googleClientId: String

    @Transactional
    fun signup(request: SignupRequest): SignupResponse {
        // Validate agreements
        if (!request.termsAgreed || !request.privacyAgreed) {
            throw BusinessException(ErrorCode.COMMON_001, mapOf(
                "message" to "이용약관 및 개인정보 처리방침에 동의해주세요."
            ))
        }

        // Create user
        val user = userService.create(
            email = request.email,
            password = request.password,
            name = request.name,
            provider = AuthProvider.LOCAL
        )

        // Create email verification token
        val verificationToken = tokenService.createEmailVerificationToken(user.id)

        // Send verification email
        mailService.sendVerificationEmail(user.email, user.name, verificationToken)

        return SignupResponse(
            user = toUserResponse(user),
            message = "인증 메일이 발송되었습니다."
        )
    }

    @Transactional
    fun verifyEmail(token: String): MessageResponse {
        val userId = tokenService.validateEmailVerificationToken(token)
        userService.verifyEmail(userId)

        // Get user and send welcome email
        val user = userService.findById(userId)
        if (user != null) {
            mailService.sendWelcomeEmail(user.email, user.name)
        }

        return MessageResponse("이메일 인증이 완료되었습니다.")
    }

    @Transactional
    fun resendVerificationEmail(email: String): MessageResponse {
        val user = userService.findByEmail(email)

        if (user == null) {
            // Don't reveal if email exists
            return MessageResponse("인증 메일이 재발송되었습니다.")
        }

        if (user.emailVerified) {
            throw BusinessException(ErrorCode.COMMON_001, mapOf(
                "message" to "이미 인증된 이메일입니다."
            ))
        }

        val verificationToken = tokenService.createEmailVerificationToken(user.id)
        mailService.sendVerificationEmail(user.email, user.name, verificationToken)

        return MessageResponse("인증 메일이 재발송되었습니다.")
    }

    @Transactional
    fun login(request: LoginRequest, deviceInfo: String? = null): LoginResponse {
        val user = userService.findByEmail(request.email)
            ?: throw BusinessException(ErrorCode.AUTH_004)

        // Check if user is local auth
        if (user.provider != AuthProvider.LOCAL || user.passwordHash == null) {
            throw BusinessException(ErrorCode.AUTH_004)
        }

        // Verify password
        val passwordHash = user.passwordHash ?: throw BusinessException(ErrorCode.AUTH_004)
        val isPasswordValid = CryptoUtil.verifyPassword(request.password, passwordHash)
        if (!isPasswordValid) {
            throw BusinessException(ErrorCode.AUTH_004)
        }

        // Check user status
        when (user.status) {
            UserStatus.INACTIVE -> throw BusinessException(ErrorCode.AUTH_006)
            UserStatus.WITHDRAWN -> throw BusinessException(ErrorCode.AUTH_007)
            UserStatus.ACTIVE -> { /* OK */ }
        }

        // Check email verification
        if (!user.emailVerified) {
            throw BusinessException(ErrorCode.AUTH_005)
        }

        // Generate tokens
        val tokens = generateTokens(user, deviceInfo, request.rememberMe)

        // Update last login
        userService.updateLastLogin(user.id)

        return LoginResponse(
            user = toUserResponse(user),
            tokens = tokens
        )
    }

    @Transactional
    fun googleAuth(request: GoogleAuthRequest, deviceInfo: String? = null): LoginResponse {
        // Verify Google ID token
        val payload = try {
            val verifier = GoogleIdTokenVerifier.Builder(
                NetHttpTransport(),
                GsonFactory.getDefaultInstance()
            )
                .setAudience(listOf(googleClientId))
                .build()
            
            val idToken = verifier.verify(request.idToken)
                ?: throw BusinessException(ErrorCode.AUTH_002, mapOf("message" to "Invalid Google token"))
            
            idToken.payload
        } catch (e: Exception) {
            logger.error("Google token verification failed", e)
            throw BusinessException(ErrorCode.AUTH_002, mapOf("message" to "Invalid Google token"))
        }

        val email = payload.email
            ?: throw BusinessException(ErrorCode.AUTH_002, mapOf("message" to "Invalid Google token payload"))
        val providerId = payload.subject
        val name = (payload["name"] as? String) ?: email.substringBefore("@")
        val picture = payload["picture"] as? String

        // Find or create user
        var user = userService.findByProvider(AuthProvider.GOOGLE, providerId)

        if (user == null) {
            // Check if email already exists with different provider
            val existingUser = userService.findByEmail(email)
            if (existingUser != null) {
                throw BusinessException(ErrorCode.USER_001, mapOf(
                    "message" to "이미 다른 방식으로 가입된 이메일입니다."
                ))
            }

            // Create new user
            user = userService.create(
                email = email,
                name = name,
                provider = AuthProvider.GOOGLE,
                providerId = providerId,
                profileImageUrl = picture
            )

            // Send welcome email for new users
            mailService.sendWelcomeEmail(user.email, user.name)
        }

        // Check user status
        when (user.status) {
            UserStatus.INACTIVE -> throw BusinessException(ErrorCode.AUTH_006)
            UserStatus.WITHDRAWN -> throw BusinessException(ErrorCode.AUTH_007)
            UserStatus.ACTIVE -> { /* OK */ }
        }

        // Generate tokens
        val tokens = generateTokens(user, deviceInfo)

        // Update last login
        userService.updateLastLogin(user.id)

        return LoginResponse(
            user = toUserResponse(user),
            tokens = tokens
        )
    }

    @Transactional
    fun refreshTokens(request: RefreshTokenRequest, deviceInfo: String? = null): RefreshTokenResponse {
        val userId = tokenService.validateRefreshToken(request.refreshToken)
        val user = userService.findByIdOrFail(userId)

        // Check user status
        if (user.status != UserStatus.ACTIVE) {
            throw BusinessException(ErrorCode.AUTH_006)
        }

        // Rotate refresh token
        val newRefreshToken = tokenService.rotateRefreshToken(request.refreshToken, deviceInfo)

        // Generate new access token
        val accessToken = jwtTokenProvider.generateAccessToken(user.id.toString(), user.email)

        return RefreshTokenResponse(
            tokens = TokenPair(
                accessToken = accessToken,
                refreshToken = newRefreshToken,
                expiresIn = jwtTokenProvider.getAccessTokenExpiration()
            )
        )
    }

    @Transactional
    fun logout(userId: UUID, refreshToken: String? = null, allDevices: Boolean = false) {
        if (allDevices) {
            tokenService.deleteAllRefreshTokens(userId)
        } else if (refreshToken != null) {
            tokenService.deleteRefreshToken(refreshToken)
        }
    }

    @Transactional
    fun forgotPassword(request: ForgotPasswordRequest): MessageResponse {
        val user = userService.findByEmail(request.email)

        // Always return success to prevent email enumeration
        val message = "비밀번호 재설정 메일이 발송되었습니다."

        if (user == null) {
            return MessageResponse(message)
        }

        // Only for local auth users
        if (user.provider != AuthProvider.LOCAL) {
            return MessageResponse(message)
        }

        // Create password reset token
        val resetToken = tokenService.createPasswordResetToken(user.id)

        // Send password reset email
        mailService.sendPasswordResetEmail(user.email, user.name, resetToken)

        return MessageResponse(message)
    }

    @Transactional
    fun resetPassword(request: ResetPasswordRequest): MessageResponse {
        val userId = tokenService.validatePasswordResetToken(request.token)
        userService.resetPassword(userId, request.newPassword)

        // Invalidate all refresh tokens for security
        tokenService.deleteAllRefreshTokens(userId)

        return MessageResponse("비밀번호가 재설정되었습니다.")
    }

    // ==================== Private Helper Methods ====================

    private fun generateTokens(
        user: User,
        deviceInfo: String? = null,
        rememberMe: Boolean = false
    ): TokenPair {
        val accessToken = jwtTokenProvider.generateAccessToken(user.id.toString(), user.email)
        val refreshToken = tokenService.createRefreshToken(user.id, deviceInfo, rememberMe)

        return TokenPair(
            accessToken = accessToken,
            refreshToken = refreshToken,
            expiresIn = jwtTokenProvider.getAccessTokenExpiration()
        )
    }

    private fun toUserResponse(user: User): UserResponse {
        return UserResponse(
            id = user.id,
            email = user.email,
            name = user.name,
            profileImageUrl = user.profileImageUrl,
            provider = user.provider.name.lowercase(),
            emailVerified = user.emailVerified,
            familyGroupId = user.familyGroupId
        )
    }
}
