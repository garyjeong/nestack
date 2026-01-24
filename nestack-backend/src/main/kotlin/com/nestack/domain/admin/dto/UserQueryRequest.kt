package com.nestack.domain.admin.dto

import com.nestack.common.enum.UserStatus

data class UserQueryRequest(
    val search: String? = null,
    val status: UserStatus? = null,
    val page: Int = 1,
    val limit: Int = 20
)
