package com.nestack.infrastructure.persistence.repository

import com.nestack.common.enum.CategoryStatus
import com.nestack.infrastructure.persistence.entity.MissionTemplate
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface MissionTemplateRepository : JpaRepository<MissionTemplate, UUID> {
    fun findByCategoryId(categoryId: UUID): List<MissionTemplate>
    
    fun findByCategoryIdAndStatus(categoryId: UUID, status: CategoryStatus): List<MissionTemplate>
}
