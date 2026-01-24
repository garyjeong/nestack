package com.nestack.domain.family.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class JoinFamilyRequest(
    @field:NotBlank(message = "초대 코드를 입력해주세요.")
    @field:Size(min = 12, max = 12, message = "초대 코드는 12자리입니다.")
    val inviteCode: String
)
