package com.nestack.infrastructure.persistence.entity

import com.nestack.common.enum.TransactionType
import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.util.*

@Entity
@Table(name = "transactions", indexes = [
    Index(name = "idx_transaction_bank_account", columnList = "bank_account_id"),
    Index(name = "idx_transaction_mission", columnList = "mission_id"),
    Index(name = "idx_transaction_date", columnList = "transaction_date")
])
@EntityListeners(AuditingEntityListener::class)
class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "UUID")
    var id: UUID = UUID.randomUUID()

    @Column(name = "bank_account_id", columnDefinition = "UUID", nullable = false)
    var bankAccountId: UUID = UUID.randomUUID()

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_account_id", insertable = false, updatable = false)
    var bankAccount: BankAccount? = null

    @Column(name = "transaction_id", length = 100, nullable = false)
    var transactionId: String = "" // Open Banking transaction ID

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    var type: TransactionType = TransactionType.DEPOSIT

    @Column(name = "amount", precision = 18, scale = 2, nullable = false)
    var amount: BigDecimal = BigDecimal.ZERO

    @Column(name = "balance_after", precision = 18, scale = 2, nullable = false)
    var balanceAfter: BigDecimal = BigDecimal.ZERO

    @Column(name = "description", length = 255, nullable = true)
    var description: String? = null

    @Column(name = "counterparty", length = 100, nullable = true)
    var counterparty: String? = null

    @Column(name = "transaction_date", nullable = false)
    var transactionDate: LocalDate = LocalDate.now()

    @Column(name = "transaction_time", nullable = true)
    var transactionTime: LocalTime? = null

    @Column(name = "mission_id", columnDefinition = "UUID", nullable = true)
    var missionId: UUID? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mission_id", insertable = false, updatable = false)
    var mission: Mission? = null

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
}
