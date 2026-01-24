package com.nestack.infrastructure.persistence.entity

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "mission_shared_accounts", indexes = [
    Index(name = "idx_mission_shared_account", columnList = "mission_id,bank_account_id")
])
@EntityListeners(AuditingEntityListener::class)
class MissionSharedAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "UUID")
    var id: UUID = UUID.randomUUID()

    @Column(name = "mission_id", columnDefinition = "UUID", nullable = false)
    var missionId: UUID = UUID.randomUUID()

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mission_id", insertable = false, updatable = false)
    var mission: Mission? = null

    @Column(name = "bank_account_id", columnDefinition = "UUID", nullable = false)
    var bankAccountId: UUID = UUID.randomUUID()

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_account_id", insertable = false, updatable = false)
    var bankAccount: BankAccount? = null

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
}
