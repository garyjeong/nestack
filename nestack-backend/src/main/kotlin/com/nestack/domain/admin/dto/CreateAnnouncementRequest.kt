package com.nestack.domain.admin.dto

import com.nestack.common.enum.DisplayType
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.time.LocalDateTime

data class CreateAnnouncementRequest(
    @field:NotBlank(message = "제목은 필수입니다.")
    val title: String,
    
    @field:NotBlank(message = "내용은 필수입니다.")
    val content: String,
    
    @field:NotNull(message = "표시 타입은 필수입니다.")
    val displayType: DisplayType,
    
    @field:NotNull(message = "시작일은 필수입니다.")
    val startDate: LocalDateTime,
    
    @field:NotNull(message = "종료일은 필수입니다.")
    val endDate: LocalDateTime
)
