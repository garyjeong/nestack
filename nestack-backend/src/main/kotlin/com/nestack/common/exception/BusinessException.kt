package com.nestack.common.exception

import com.nestack.common.constant.ErrorCode
import org.springframework.http.HttpStatus

class BusinessException(
    val errorCode: ErrorCode,
    val details: Map<String, Any>? = null
) : RuntimeException(errorCode.message) {
    val status: HttpStatus
        get() = HttpStatus.valueOf(errorCode.status)
}
