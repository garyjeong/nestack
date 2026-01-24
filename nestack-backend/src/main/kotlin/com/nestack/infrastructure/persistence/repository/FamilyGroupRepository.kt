package com.nestack.infrastructure.persistence.repository

import com.nestack.infrastructure.persistence.entity.FamilyGroup
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface FamilyGroupRepository : JpaRepository<FamilyGroup, UUID> {
    fun findByCreatedBy(createdBy: UUID): FamilyGroup?
}
