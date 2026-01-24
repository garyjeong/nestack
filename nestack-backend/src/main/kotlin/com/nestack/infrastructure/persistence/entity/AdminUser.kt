package com.nestack.infrastructure.persistence.entity

import com.nestack.common.enum.AdminRole
import com.nestack.common.enum.AdminStatus
import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "admin_users", indexes = [
    Index(name = "idx_admin_email", columnList = "email")
])
@EntityListeners(AuditingEntityListener::class)
class AdminUser {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "UUID")
    var id: UUID = UUID.randomUUID()

    @Column(name = "email", length = 255, unique = true, nullable = false)
    var email: String = ""

    @Column(name = "password_hash", length = 255, nullable = false)
    var passwordHash: String = ""

    @Column(name = "name", length = 100, nullable = false)
    var name: String = ""

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    var role: AdminRole = AdminRole.ADMIN

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: AdminStatus = AdminStatus.ACTIVE

    @Column(name = "last_login_at", nullable = true)
    var lastLoginAt: LocalDateTime? = null

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
}
