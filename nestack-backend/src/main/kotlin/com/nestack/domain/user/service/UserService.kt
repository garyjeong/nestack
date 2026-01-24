package com.nestack.domain.user.service

import com.nestack.common.constant.ErrorCode
import com.nestack.common.enum.AuthProvider
import com.nestack.common.enum.UserStatus
import com.nestack.common.exception.BusinessException
import com.nestack.common.util.CryptoUtil
import com.nestack.infrastructure.persistence.entity.User
import com.nestack.infrastructure.persistence.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.*

@Service
class UserService(
    private val userRepository: UserRepository
) {
    @Transactional
    fun create(
        email: String,
        password: String? = null,
        name: String,
        provider: AuthProvider = AuthProvider.LOCAL,
        providerId: String? = null,
        profileImageUrl: String? = null
    ): User {
        // Check if email already exists
        if (userRepository.findByEmail(email) != null) {
            throw BusinessException(ErrorCode.USER_001)
        }

        val user = User().apply {
            this.email = email
            this.name = name
            this.provider = provider
            this.providerId = providerId
            this.profileImageUrl = profileImageUrl
            this.emailVerified = provider != AuthProvider.LOCAL // Social login users are auto-verified
            if (provider == AuthProvider.LOCAL && password != null) {
                this.passwordHash = CryptoUtil.hashPassword(password)
            }
        }

        return userRepository.save(user)
    }

    @Transactional(readOnly = true)
    fun findById(id: UUID): User? {
        return userRepository.findById(id).orElse(null)
    }

    @Transactional(readOnly = true)
    fun findByIdOrFail(id: UUID): User {
        return userRepository.findById(id)
            .orElseThrow { BusinessException(ErrorCode.USER_003) }
    }

    @Transactional(readOnly = true)
    fun findByEmail(email: String): User? {
        return userRepository.findByEmail(email)
    }

    @Transactional(readOnly = true)
    fun findByProvider(provider: AuthProvider, providerId: String): User? {
        return userRepository.findByProviderAndProviderId(provider, providerId)
    }

    @Transactional
    fun verifyEmail(userId: UUID) {
        val user = findByIdOrFail(userId)
        user.emailVerified = true
        user.emailVerifiedAt = LocalDateTime.now()
        userRepository.save(user)
    }

    @Transactional
    fun updateLastLogin(userId: UUID) {
        val user = findByIdOrFail(userId)
        user.lastLoginAt = LocalDateTime.now()
        userRepository.save(user)
    }

    @Transactional
    fun resetPassword(userId: UUID, newPassword: String) {
        val user = findByIdOrFail(userId)
        user.passwordHash = CryptoUtil.hashPassword(newPassword)
        userRepository.save(user)
    }

    @Transactional(readOnly = true)
    fun getProfile(userId: UUID): User {
        return userRepository.findById(userId)
            .orElseThrow { BusinessException(ErrorCode.USER_003) }
    }

    @Transactional
    fun updateProfile(userId: UUID, name: String?, profileImageUrl: String?): User {
        val user = findByIdOrFail(userId)
        
        if (name != null) {
            user.name = name
        }
        
        if (profileImageUrl != null) {
            user.profileImageUrl = profileImageUrl
        }
        
        return userRepository.save(user)
    }

    @Transactional
    fun changePassword(userId: UUID, currentPassword: String, newPassword: String) {
        val user = findByIdOrFail(userId)

        // Check if user has a password (local auth)
        val passwordHash = user.passwordHash
            ?: throw BusinessException(ErrorCode.AUTH_004)

        // Verify current password
        val isPasswordValid = CryptoUtil.verifyPassword(currentPassword, passwordHash)
        if (!isPasswordValid) {
            throw BusinessException(ErrorCode.USER_004)
        }

        // Hash and save new password
        user.passwordHash = CryptoUtil.hashPassword(newPassword)
        userRepository.save(user)
    }

    @Transactional
    fun updateFamilyGroup(userId: UUID, familyGroupId: UUID?) {
        val user = findByIdOrFail(userId)
        user.familyGroupId = familyGroupId
        userRepository.save(user)
    }

    @Transactional
    fun withdraw(userId: UUID, password: String) {
        val user = findByIdOrFail(userId)

        // Verify password for local users
        val passwordHash = user.passwordHash
        if (user.provider == AuthProvider.LOCAL && passwordHash != null) {
            val isPasswordValid = CryptoUtil.verifyPassword(password, passwordHash)
            if (!isPasswordValid) {
                throw BusinessException(ErrorCode.USER_004)
            }
        }

        // Update status and remove from family group
        user.status = UserStatus.WITHDRAWN
        user.familyGroupId = null
        user.deletedAt = LocalDateTime.now()
        userRepository.save(user)
    }
}
