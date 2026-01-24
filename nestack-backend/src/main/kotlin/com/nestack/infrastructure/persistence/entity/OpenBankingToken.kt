package com.nestack.infrastructure.persistence.entity

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "openbanking_tokens")
@EntityListeners(AuditingEntityListener::class)
class OpenBankingToken {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "UUID")
    var id: UUID = UUID.randomUUID()

    @Column(name = "user_id", columnDefinition = "UUID", unique = true, nullable = false)
    var userId: UUID = UUID.randomUUID()

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    var user: User? = null

    @Column(name = "access_token", columnDefinition = "TEXT", nullable = false)
    var accessToken: String = "" // Encrypted

    @Column(name = "refresh_token", columnDefinition = "TEXT", nullable = false)
    var refreshToken: String = "" // Encrypted

    @Column(name = "token_type", length = 50, nullable = false)
    var tokenType: String = ""

    @Column(name = "scope", length = 255, nullable = false)
    var scope: String = ""

    @Column(name = "user_seq_no", length = 50, nullable = false)
    var userSeqNo: String = "" // Open Banking user sequence number

    @Column(name = "expires_at", nullable = false)
    var expiresAt: LocalDateTime = LocalDateTime.now()

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
}
