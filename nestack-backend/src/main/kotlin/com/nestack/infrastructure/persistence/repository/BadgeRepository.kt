package com.nestack.infrastructure.persistence.repository

import com.nestack.common.enum.CategoryStatus
import com.nestack.infrastructure.persistence.entity.Badge
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface BadgeRepository : JpaRepository<Badge, UUID> {
    fun findByStatus(status: CategoryStatus): List<Badge>
}
