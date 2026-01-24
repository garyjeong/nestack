package com.nestack.domain.admin.dto

import com.nestack.common.enum.AdminRole
import java.util.*

data class AdminInfo(
    val id: UUID,
    val email: String,
    val name: String,
    val role: AdminRole
)

data class AdminLoginResponse(
    val accessToken: String,
    val admin: AdminInfo
)
