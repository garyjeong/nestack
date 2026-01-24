package com.nestack.domain.mission.dto

import jakarta.validation.constraints.NotEmpty
import java.util.*

data class LinkTransactionRequest(
    @field:NotEmpty(message = "거래 ID 목록은 필수입니다.")
    val transactionIds: List<UUID>
)
