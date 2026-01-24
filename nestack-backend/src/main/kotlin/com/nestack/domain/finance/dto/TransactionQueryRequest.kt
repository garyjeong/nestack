package com.nestack.domain.finance.dto

import com.nestack.common.enum.TransactionType
import java.time.LocalDate

data class TransactionQueryRequest(
    val startDate: LocalDate? = null,
    val endDate: LocalDate? = null,
    val type: TransactionType? = null
)
