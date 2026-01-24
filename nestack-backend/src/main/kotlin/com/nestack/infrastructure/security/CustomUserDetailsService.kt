package com.nestack.infrastructure.security

import com.nestack.common.constant.ErrorCode
import com.nestack.common.enum.UserStatus
import com.nestack.common.exception.BusinessException
import com.nestack.infrastructure.persistence.entity.User
import com.nestack.infrastructure.persistence.repository.UserRepository
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class CustomUserDetailsService(
    private val userRepository: UserRepository
) : UserDetailsService {

    @Transactional(readOnly = true)
    override fun loadUserByUsername(username: String): UserDetails {
        val userId = try {
            UUID.fromString(username)
        } catch (e: IllegalArgumentException) {
            throw BusinessException(ErrorCode.USER_003)
        }
        
        val user = userRepository.findById(userId)
            .orElseThrow { BusinessException(ErrorCode.USER_003) }

        // Check user status
        when (user.status) {
            UserStatus.INACTIVE -> throw BusinessException(ErrorCode.AUTH_006)
            UserStatus.WITHDRAWN -> throw BusinessException(ErrorCode.AUTH_007)
            UserStatus.ACTIVE -> { /* OK */ }
        }

        return CustomUserPrincipal(user)
    }
}

class CustomUserPrincipal(
    val user: User
) : UserDetails {
    override fun getAuthorities() = listOf(SimpleGrantedAuthority("ROLE_USER"))

    override fun getPassword() = user.passwordHash

    override fun getUsername() = user.id.toString()

    override fun isAccountNonExpired() = true

    override fun isAccountNonLocked() = user.status == UserStatus.ACTIVE

    override fun isCredentialsNonExpired() = true

    override fun isEnabled() = user.status == UserStatus.ACTIVE && user.emailVerified
}
