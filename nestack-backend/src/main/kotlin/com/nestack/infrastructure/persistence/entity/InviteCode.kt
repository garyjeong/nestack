package com.nestack.infrastructure.persistence.entity

import com.nestack.common.enum.InviteCodeStatus
import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "invite_codes", indexes = [
    Index(name = "idx_invite_code_code", columnList = "code"),
    Index(name = "idx_invite_code_family_group", columnList = "family_group_id")
])
@EntityListeners(AuditingEntityListener::class)
class InviteCode {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "UUID")
    var id: UUID = UUID.randomUUID()

    @Column(name = "code", length = 12, unique = true, nullable = false)
    var code: String = ""

    @Column(name = "family_group_id", columnDefinition = "UUID", nullable = false)
    var familyGroupId: UUID = UUID.randomUUID()

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "family_group_id", insertable = false, updatable = false)
    var familyGroup: FamilyGroup? = null

    @Column(name = "created_by", columnDefinition = "UUID", nullable = false)
    var createdBy: UUID = UUID.randomUUID()

    @Column(name = "used_by", columnDefinition = "UUID", nullable = true)
    var usedBy: UUID? = null

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: InviteCodeStatus = InviteCodeStatus.PENDING

    @Column(name = "expires_at", nullable = false)
    var expiresAt: LocalDateTime = LocalDateTime.now()

    @Column(name = "used_at", nullable = true)
    var usedAt: LocalDateTime? = null

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
}
