package com.nestack.infrastructure.persistence.entity

import com.nestack.common.enum.ShareStatus
import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "bank_accounts", indexes = [
    Index(name = "idx_bank_account_user", columnList = "user_id"),
    Index(name = "idx_bank_account_fintech", columnList = "fintech_use_num")
])
@EntityListeners(AuditingEntityListener::class)
class BankAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "UUID")
    var id: UUID = UUID.randomUUID()

    @Column(name = "user_id", columnDefinition = "UUID", nullable = false)
    var userId: UUID = UUID.randomUUID()

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    var user: User? = null

    @Column(name = "bank_code", length = 10, nullable = false)
    var bankCode: String = ""

    @Column(name = "bank_name", length = 50, nullable = false)
    var bankName: String = ""

    @Column(name = "account_number", length = 50, nullable = false)
    var accountNumber: String = "" // Encrypted

    @Column(name = "account_number_masked", length = 50, nullable = false)
    var accountNumberMasked: String = ""

    @Column(name = "account_alias", length = 100, nullable = true)
    var accountAlias: String? = null

    @Column(name = "account_type", length = 50, nullable = true)
    var accountType: String? = null

    @Column(name = "balance", precision = 18, scale = 2, nullable = false)
    var balance: BigDecimal = BigDecimal.ZERO

    @Column(name = "fintech_use_num", length = 100, nullable = false)
    var fintechUseNum: String = ""

    @Enumerated(EnumType.STRING)
    @Column(name = "share_status", nullable = false)
    var shareStatus: ShareStatus = ShareStatus.PRIVATE

    @Column(name = "is_hidden", nullable = false)
    var isHidden: Boolean = false

    @Column(name = "last_synced_at", nullable = true)
    var lastSyncedAt: LocalDateTime? = null

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()

    @OneToMany(mappedBy = "bankAccount", fetch = FetchType.LAZY)
    var transactions: MutableList<Transaction> = mutableListOf()
}
