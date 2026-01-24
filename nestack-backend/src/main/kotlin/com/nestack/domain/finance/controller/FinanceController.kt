package com.nestack.domain.finance.controller

import com.nestack.common.annotation.CurrentUser
import com.nestack.common.annotation.Public
import com.nestack.common.dto.successResponse
import com.nestack.domain.finance.dto.TransactionQueryRequest
import com.nestack.domain.finance.dto.UpdateAccountRequest
import com.nestack.domain.finance.service.FinanceService
import com.nestack.infrastructure.persistence.entity.User
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletResponse
import jakarta.validation.Valid
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*

@Tag(name = "finance", description = "Finance management endpoints")
@RestController
@RequestMapping("/api/v1/finance")
class FinanceController(
    private val financeService: FinanceService
) {
    @Value("\${spring.frontend-url:http://localhost:5173}")
    private var frontendUrl: String = "http://localhost:5173"

    @GetMapping("/openbanking/authorize")
    @Operation(summary = "오픈뱅킹 인증 시작")
    fun authorize(@CurrentUser user: User, response: HttpServletResponse) {
        val state = Base64.getEncoder().encodeToString("{\"userId\":\"${user.id}\"}".toByteArray())
        val authUrl = financeService.getAuthorizationUrl(state)
        response.sendRedirect(authUrl)
    }

    @GetMapping("/openbanking/callback")
    @Public
    @Operation(summary = "오픈뱅킹 콜백 처리")
    fun callback(
        @RequestParam code: String,
        @RequestParam state: String,
        response: HttpServletResponse
    ) {
        try {
            val stateData = String(Base64.getDecoder().decode(state))
            val userId = UUID.fromString(
                stateData.substringAfter("\"userId\":\"").substringBefore("\"")
            )

            financeService.handleCallback(userId, code)
            response.sendRedirect("$frontendUrl/finance/connected")
        } catch (e: Exception) {
            response.sendRedirect("$frontendUrl/finance/error")
        }
    }

    @GetMapping("/openbanking/status")
    @Operation(summary = "오픈뱅킹 연동 상태 확인")
    fun getConnectionStatus(@CurrentUser user: User): ResponseEntity<*> {
        val isConnected = financeService.isConnected(user.id)
        return ResponseEntity.ok(successResponse(mapOf("isConnected" to isConnected)))
    }

    @DeleteMapping("/openbanking")
    @Operation(summary = "오픈뱅킹 연동 해제")
    fun disconnect(@CurrentUser user: User): ResponseEntity<*> {
        financeService.disconnect(user.id)
        return ResponseEntity.ok(successResponse(mapOf("message" to "오픈뱅킹 연동이 해제되었습니다.")))
    }

    @GetMapping("/accounts")
    @Operation(summary = "연동 계좌 목록 조회")
    fun getAccounts(@CurrentUser user: User): ResponseEntity<*> {
        val accounts = financeService.getAccounts(user.id)
        return ResponseEntity.ok(successResponse(mapOf("accounts" to accounts)))
    }

    @PostMapping("/accounts/sync")
    @Operation(summary = "계좌 동기화")
    fun syncAccounts(@CurrentUser user: User): ResponseEntity<*> {
        val accounts = financeService.syncAccounts(user.id)
        return ResponseEntity.ok(successResponse(mapOf(
            "accounts" to accounts,
            "message" to "계좌가 동기화되었습니다."
        )))
    }

    @PatchMapping("/accounts/{accountId}")
    @Operation(summary = "계좌 설정 수정")
    fun updateAccount(
        @CurrentUser user: User,
        @PathVariable accountId: UUID,
        @Valid @RequestBody request: UpdateAccountRequest
    ): ResponseEntity<*> {
        val account = financeService.updateAccount(user.id, accountId, request)
        return ResponseEntity.ok(successResponse(mapOf("account" to account)))
    }

    @PostMapping("/accounts/{accountId}/transactions/sync")
    @Operation(summary = "거래 내역 동기화")
    fun syncAccountTransactions(
        @CurrentUser user: User,
        @PathVariable accountId: UUID
    ): ResponseEntity<*> {
        val transactions = financeService.syncAccountTransactions(user.id, accountId)
        return ResponseEntity.ok(successResponse(mapOf(
            "transactions" to transactions,
            "message" to "거래 내역이 동기화되었습니다."
        )))
    }

    @GetMapping("/transactions")
    @Operation(summary = "거래 내역 조회")
    fun getTransactions(
        @CurrentUser user: User,
        @RequestParam(required = false) accountId: UUID?,
        @RequestParam(required = false) startDate: String?,
        @RequestParam(required = false) endDate: String?,
        @RequestParam(required = false) type: String?
    ): ResponseEntity<*> {
        val query = TransactionQueryRequest(
            startDate = startDate?.let { java.time.LocalDate.parse(it) },
            endDate = endDate?.let { java.time.LocalDate.parse(it) },
            type = type?.let { com.nestack.common.enum.TransactionType.valueOf(it.uppercase()) }
        )
        val transactions = financeService.getTransactions(user.id, accountId, query)
        return ResponseEntity.ok(successResponse(mapOf("transactions" to transactions)))
    }
}
