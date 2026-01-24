package com.nestack.infrastructure.persistence.repository

import com.nestack.common.enum.CategoryStatus
import com.nestack.infrastructure.persistence.entity.LifeCycleCategory
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface LifeCycleCategoryRepository : JpaRepository<LifeCycleCategory, UUID> {
    fun findByStatus(status: CategoryStatus): List<LifeCycleCategory>
    
    @Query("SELECT c FROM LifeCycleCategory c WHERE c.status = :status ORDER BY c.displayOrder ASC")
    fun findByStatusOrderByDisplayOrder(@Param("status") status: CategoryStatus): List<LifeCycleCategory>
}
