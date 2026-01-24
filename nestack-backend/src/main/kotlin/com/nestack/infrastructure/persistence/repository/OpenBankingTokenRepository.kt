package com.nestack.infrastructure.persistence.repository

import com.nestack.infrastructure.persistence.entity.OpenBankingToken
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface OpenBankingTokenRepository : JpaRepository<OpenBankingToken, UUID> {
    fun findByUserId(userId: UUID): OpenBankingToken?
}
