package com.nestack.infrastructure.persistence.repository

import com.nestack.infrastructure.persistence.entity.BankAccount
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface BankAccountRepository : JpaRepository<BankAccount, UUID> {
    fun findByUserId(userId: UUID): List<BankAccount>
    
    fun findByUserIdAndId(userId: UUID, id: UUID): BankAccount?
    
    @Query("SELECT ba FROM BankAccount ba WHERE ba.userId IN :userIds")
    fun findByUserIds(@Param("userIds") userIds: List<UUID>): List<BankAccount>
}
