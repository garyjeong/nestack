package com.nestack.infrastructure.persistence.repository

import com.nestack.infrastructure.persistence.entity.Transaction
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.*

@Repository
interface TransactionRepository : JpaRepository<Transaction, UUID> {
    fun findByBankAccountId(bankAccountId: UUID): List<Transaction>
    
    fun findByMissionId(missionId: UUID): List<Transaction>
    
    @Query("SELECT t FROM Transaction t WHERE t.bankAccountId IN :bankAccountIds")
    fun findByBankAccountIds(@Param("bankAccountIds") bankAccountIds: List<UUID>): List<Transaction>
    
    @Query("SELECT t FROM Transaction t WHERE t.bankAccountId IN :bankAccountIds AND t.transactionDate BETWEEN :startDate AND :endDate")
    fun findByBankAccountIdsAndDateRange(
        @Param("bankAccountIds") bankAccountIds: List<UUID>,
        @Param("startDate") startDate: LocalDate,
        @Param("endDate") endDate: LocalDate
    ): List<Transaction>
}
