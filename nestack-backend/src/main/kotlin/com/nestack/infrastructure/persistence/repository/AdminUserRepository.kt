package com.nestack.infrastructure.persistence.repository

import com.nestack.infrastructure.persistence.entity.AdminUser
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface AdminUserRepository : JpaRepository<AdminUser, UUID> {
    fun findByEmail(email: String): AdminUser?
}
