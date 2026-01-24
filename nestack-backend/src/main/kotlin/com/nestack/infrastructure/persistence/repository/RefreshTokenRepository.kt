package com.nestack.infrastructure.persistence.repository

import com.nestack.infrastructure.persistence.entity.RefreshToken
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.*

@Repository
interface RefreshTokenRepository : JpaRepository<RefreshToken, UUID> {
    fun findByToken(token: String): RefreshToken?
    
    fun findByUserId(userId: UUID): List<RefreshToken>
    
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.userId = :userId")
    fun deleteByUserId(@Param("userId") userId: UUID)
    
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.token = :token")
    fun deleteByToken(@Param("token") token: String)
    
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :now")
    fun deleteExpiredTokens(@Param("now") now: LocalDateTime)
}
