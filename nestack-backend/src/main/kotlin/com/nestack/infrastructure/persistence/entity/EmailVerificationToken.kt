package com.nestack.infrastructure.persistence.entity

import com.nestack.common.enum.TokenType
import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "email_verification_tokens", indexes = [
    Index(name = "idx_email_token_user", columnList = "user_id"),
    Index(name = "idx_email_token_token", columnList = "token", unique = true)
])
class EmailVerificationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "UUID")
    var id: UUID = UUID.randomUUID()

    @Column(name = "user_id", columnDefinition = "UUID", nullable = false)
    var userId: UUID = UUID.randomUUID()

    @Column(name = "token", length = 255, unique = true, nullable = false)
    var token: String = ""

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    var type: TokenType = TokenType.EMAIL_VERIFY

    @Column(name = "expires_at", nullable = false)
    var expiresAt: LocalDateTime = LocalDateTime.now()

    @Column(name = "used_at", nullable = true)
    var usedAt: LocalDateTime? = null

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
}
