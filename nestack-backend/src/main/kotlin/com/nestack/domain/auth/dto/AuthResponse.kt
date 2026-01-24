package com.nestack.domain.auth.dto

import java.time.LocalDateTime
import java.util.*

data class UserResponse(
    val id: UUID,
    val email: String,
    val name: String,
    val profileImageUrl: String?,
    val provider: String,
    val emailVerified: Boolean,
    val familyGroupId: UUID?
)

data class TokenPair(
    val accessToken: String,
    val refreshToken: String,
    val expiresIn: Long
)

data class SignupResponse(
    val user: UserResponse,
    val message: String
)

data class LoginResponse(
    val user: UserResponse,
    val tokens: TokenPair
)

data class RefreshTokenResponse(
    val tokens: TokenPair
)

data class MessageResponse(
    val message: String
)
