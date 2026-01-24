package com.nestack.domain.family.dto

import com.nestack.common.enum.ShareStatus
import jakarta.validation.Valid
import java.util.*

data class AccountShareSetting(
    val accountId: UUID,
    val shareStatus: ShareStatus? = null
)

data class UpdateShareSettingsRequest(
    @field:Valid
    val accounts: List<AccountShareSetting> = emptyList()
)
