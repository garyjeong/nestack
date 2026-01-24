package com.nestack.domain.admin.dto

import jakarta.validation.constraints.NotBlank

data class CreateCategoryRequest(
    @field:NotBlank(message = "카테고리 이름은 필수입니다.")
    val name: String,
    
    val displayOrder: Int? = null
)
