package com.nestack.infrastructure.persistence.repository

import com.nestack.common.enum.TokenType
import com.nestack.infrastructure.persistence.entity.EmailVerificationToken
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.*

@Repository
interface EmailVerificationTokenRepository : JpaRepository<EmailVerificationToken, UUID> {
    fun findByTokenAndType(token: String, type: TokenType): EmailVerificationToken?
    
    fun findByUserIdAndType(userId: UUID, type: TokenType): List<EmailVerificationToken>
    
    @Modifying
    @Query("DELETE FROM EmailVerificationToken e WHERE e.expiresAt < :now")
    fun deleteExpiredTokens(@Param("now") now: LocalDateTime)
}
