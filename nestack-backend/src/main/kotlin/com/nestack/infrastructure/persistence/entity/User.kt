package com.nestack.infrastructure.persistence.entity

import com.nestack.common.enum.AuthProvider
import com.nestack.common.enum.UserStatus
import jakarta.persistence.*
import org.hibernate.annotations.Where
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "users", indexes = [
    Index(name = "idx_user_email", columnList = "email"),
    Index(name = "idx_user_family_group", columnList = "family_group_id"),
    Index(name = "idx_user_provider", columnList = "provider,provider_id")
])
@Where(clause = "deleted_at IS NULL")
@EntityListeners(AuditingEntityListener::class)
class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "UUID")
    var id: UUID = UUID.randomUUID()

    @Column(name = "email", length = 255, unique = true, nullable = false)
    var email: String = ""

    @Column(name = "password_hash", length = 255, nullable = true)
    var passwordHash: String? = null

    @Column(name = "name", length = 100, nullable = false)
    var name: String = ""

    @Column(name = "profile_image_url", length = 500, nullable = true)
    var profileImageUrl: String? = null

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false)
    var provider: AuthProvider = AuthProvider.LOCAL

    @Column(name = "provider_id", length = 255, nullable = true)
    var providerId: String? = null

    @Column(name = "email_verified", nullable = false)
    var emailVerified: Boolean = false

    @Column(name = "email_verified_at", nullable = true)
    var emailVerifiedAt: LocalDateTime? = null

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: UserStatus = UserStatus.ACTIVE

    @Column(name = "last_login_at", nullable = true)
    var lastLoginAt: LocalDateTime? = null

    @Column(name = "family_group_id", columnDefinition = "UUID", nullable = true)
    var familyGroupId: UUID? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "family_group_id", insertable = false, updatable = false)
    var familyGroup: FamilyGroup? = null

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()

    @Column(name = "deleted_at", nullable = true)
    var deletedAt: LocalDateTime? = null
}
