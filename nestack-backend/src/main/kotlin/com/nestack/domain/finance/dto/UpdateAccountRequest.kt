package com.nestack.domain.finance.dto

import com.nestack.common.enum.ShareStatus
import jakarta.validation.constraints.Size

data class UpdateAccountRequest(
    @field:Size(max = 100, message = "계좌 별명은 100자 이하여야 합니다.")
    val accountAlias: String? = null,
    
    val shareStatus: ShareStatus? = null,
    
    val isHidden: Boolean? = null
)
