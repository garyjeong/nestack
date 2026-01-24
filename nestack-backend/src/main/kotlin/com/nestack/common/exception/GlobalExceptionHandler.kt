package com.nestack.common.exception

import com.nestack.common.dto.ApiResponse
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import java.time.Instant

@RestControllerAdvice
class GlobalExceptionHandler {

    private val logger = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    @ExceptionHandler(BusinessException::class)
    fun handleBusinessException(ex: BusinessException): ResponseEntity<ApiResponse<Nothing?>> {
        logger.debug("BusinessException: ${ex.errorCode.code} - ${ex.message}")

        val errorResponse = ApiResponse<Nothing?>(
            success = false,
            error = ApiResponse.Error(
                code = ex.errorCode.code,
                message = ex.errorCode.message,
                details = ex.details
            ),
            meta = ApiResponse.Meta(timestamp = Instant.now().toString())
        )

        return ResponseEntity.status(ex.status).body(errorResponse)
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationException(ex: MethodArgumentNotValidException): ResponseEntity<ApiResponse<Nothing?>> {
        val errors = ex.bindingResult.fieldErrors.associate { fieldError: FieldError ->
            fieldError.field to (fieldError.defaultMessage ?: "Invalid value")
        }

        val errorResponse = ApiResponse<Nothing?>(
            success = false,
            error = ApiResponse.Error(
                code = "COMMON_002",
                message = "필수 파라미터가 누락되었습니다.",
                details = errors
            ),
            meta = ApiResponse.Meta(timestamp = Instant.now().toString())
        )

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse)
    }

    @ExceptionHandler(BadCredentialsException::class)
    fun handleBadCredentialsException(ex: BadCredentialsException): ResponseEntity<ApiResponse<Nothing?>> {
        val errorResponse = ApiResponse<Nothing?>(
            success = false,
            error = ApiResponse.Error(
                code = "AUTH_004",
                message = "이메일 또는 비밀번호가 일치하지 않습니다."
            ),
            meta = ApiResponse.Meta(timestamp = Instant.now().toString())
        )

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse)
    }

    @ExceptionHandler(AccessDeniedException::class)
    fun handleAccessDeniedException(ex: AccessDeniedException): ResponseEntity<ApiResponse<Nothing?>> {
        val errorResponse = ApiResponse<Nothing?>(
            success = false,
            error = ApiResponse.Error(
                code = "AUTH_006",
                message = "접근 권한이 없습니다."
            ),
            meta = ApiResponse.Meta(timestamp = Instant.now().toString())
        )

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse)
    }

    @ExceptionHandler(Exception::class)
    fun handleGenericException(ex: Exception): ResponseEntity<ApiResponse<Nothing?>> {
        logger.error("Unexpected error occurred", ex)

        val errorResponse = ApiResponse<Nothing?>(
            success = false,
            error = ApiResponse.Error(
                code = "COMMON_003",
                message = "서버 내부 오류가 발생했습니다."
            ),
            meta = ApiResponse.Meta(timestamp = Instant.now().toString())
        )

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse)
    }
}
