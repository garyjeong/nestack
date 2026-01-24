package com.nestack.infrastructure.persistence.entity

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "refresh_tokens", indexes = [
    Index(name = "idx_refresh_token_user", columnList = "user_id"),
    Index(name = "idx_refresh_token_token", columnList = "token", unique = true)
])
class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "UUID")
    var id: UUID = UUID.randomUUID()

    @Column(name = "user_id", columnDefinition = "UUID", nullable = false)
    var userId: UUID = UUID.randomUUID()

    @Column(name = "token", length = 500, unique = true, nullable = false)
    var token: String = ""

    @Column(name = "device_info", length = 255, nullable = true)
    var deviceInfo: String? = null

    @Column(name = "expires_at", nullable = false)
    var expiresAt: LocalDateTime = LocalDateTime.now()

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
}
