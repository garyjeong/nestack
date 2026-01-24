package com.nestack.infrastructure.persistence.repository

import com.nestack.common.enum.InviteCodeStatus
import com.nestack.infrastructure.persistence.entity.InviteCode
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface InviteCodeRepository : JpaRepository<InviteCode, UUID> {
    fun findByCode(code: String): InviteCode?
    
    fun findByFamilyGroupIdAndStatus(
        familyGroupId: UUID,
        status: InviteCodeStatus
    ): InviteCode?
    
    @Query("SELECT ic FROM InviteCode ic WHERE ic.familyGroupId = :familyGroupId AND ic.status = :status ORDER BY ic.createdAt DESC")
    fun findLatestByFamilyGroupIdAndStatus(
        @Param("familyGroupId") familyGroupId: UUID,
        @Param("status") status: InviteCodeStatus
    ): InviteCode?
}
