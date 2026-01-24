package com.nestack.infrastructure.persistence.repository

import com.nestack.common.enum.MissionLevel
import com.nestack.common.enum.MissionStatus
import com.nestack.infrastructure.persistence.entity.Mission
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface MissionRepository : JpaRepository<Mission, UUID> {
    fun findByUserId(userId: UUID): List<Mission>
    
    fun findByUserIdAndId(userId: UUID, id: UUID): Mission?
    
    fun findByUserIdAndStatus(userId: UUID, status: MissionStatus): List<Mission>
    
    fun findByUserIdAndMissionLevel(userId: UUID, level: MissionLevel): List<Mission>
    
    fun findByUserIdAndCategoryId(userId: UUID, categoryId: UUID): List<Mission>
    
    fun findByUserIdAndParentMissionId(userId: UUID, parentMissionId: UUID): List<Mission>
    
    @Query("SELECT m FROM Mission m WHERE m.userId = :userId AND m.parentMissionId IS NULL")
    fun findMainMissionsByUserId(@Param("userId") userId: UUID): List<Mission>
    
    @Query("SELECT m FROM Mission m WHERE m.familyGroupId = :familyGroupId")
    fun findByFamilyGroupId(@Param("familyGroupId") familyGroupId: UUID): List<Mission>
}
