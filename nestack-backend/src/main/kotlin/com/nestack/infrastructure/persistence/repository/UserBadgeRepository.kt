package com.nestack.infrastructure.persistence.repository

import com.nestack.infrastructure.persistence.entity.UserBadge
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface UserBadgeRepository : JpaRepository<UserBadge, UUID> {
    fun findByUserId(userId: UUID): List<UserBadge>
    
    fun findByUserIdAndBadgeId(userId: UUID, badgeId: UUID): UserBadge?
    
    @Query("SELECT ub FROM UserBadge ub WHERE ub.userId = :userId AND ub.badgeId = :badgeId")
    fun existsByUserIdAndBadgeId(@Param("userId") userId: UUID, @Param("badgeId") badgeId: UUID): Boolean
}
