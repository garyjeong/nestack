package com.nestack.infrastructure.persistence.entity

import com.nestack.common.enum.FamilyGroupStatus
import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "family_groups")
@EntityListeners(AuditingEntityListener::class)
class FamilyGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "UUID")
    var id: UUID = UUID.randomUUID()

    @Column(name = "created_by", columnDefinition = "UUID", nullable = false)
    var createdBy: UUID = UUID.randomUUID()

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: FamilyGroupStatus = FamilyGroupStatus.ACTIVE

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()

    @OneToMany(mappedBy = "familyGroup", fetch = FetchType.LAZY)
    var members: MutableList<User> = mutableListOf()

    @OneToMany(mappedBy = "familyGroup", fetch = FetchType.LAZY)
    var inviteCodes: MutableList<InviteCode> = mutableListOf()
}
