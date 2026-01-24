package com.nestack.infrastructure.persistence.repository

import com.nestack.common.enum.AuthProvider
import com.nestack.infrastructure.persistence.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface UserRepository : JpaRepository<User, UUID> {
    fun findByEmail(email: String): User?
    
    fun findByProviderAndProviderId(provider: AuthProvider, providerId: String): User?
    
    @Query("SELECT u FROM User u WHERE u.familyGroupId = :familyGroupId")
    fun findByFamilyGroupId(@Param("familyGroupId") familyGroupId: UUID): List<User>
}
