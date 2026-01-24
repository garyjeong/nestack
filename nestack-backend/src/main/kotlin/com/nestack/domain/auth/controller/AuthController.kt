package com.nestack.domain.auth.controller

import com.nestack.common.annotation.CurrentUser
import com.nestack.common.annotation.Public
import com.nestack.common.dto.successResponse
import com.nestack.domain.auth.dto.*
import com.nestack.domain.auth.service.AuthService
import com.nestack.infrastructure.persistence.entity.User
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@Tag(name = "auth", description = "Authentication endpoints")
@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val authService: AuthService
) {

    @Public
    @PostMapping("/signup")
    @Operation(summary = "회원가입")
    fun signup(@Valid @RequestBody request: SignupRequest): ResponseEntity<*> {
        val response = authService.signup(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(successResponse(response))
    }

    @Public
    @GetMapping("/verify-email")
    @Operation(summary = "이메일 인증 확인")
    fun verifyEmail(@RequestParam token: String): ResponseEntity<*> {
        val response = authService.verifyEmail(token)
        return ResponseEntity.ok(successResponse(response))
    }

    @Public
    @PostMapping("/resend-verification")
    @Operation(summary = "이메일 인증 재발송")
    fun resendVerificationEmail(@RequestBody request: Map<String, String>): ResponseEntity<*> {
        val email = request["email"] ?: throw IllegalArgumentException("Email is required")
        val response = authService.resendVerificationEmail(email)
        return ResponseEntity.ok(successResponse(response))
    }

    @Public
    @PostMapping("/login")
    @Operation(summary = "로그인")
    fun login(
        @Valid @RequestBody request: LoginRequest,
        requestHttp: HttpServletRequest
    ): ResponseEntity<*> {
        val deviceInfo = requestHttp.getHeader("User-Agent")
        val response = authService.login(request, deviceInfo)
        return ResponseEntity.ok(successResponse(response))
    }

    @Public
    @PostMapping("/google")
    @Operation(summary = "Google 로그인")
    fun googleAuth(
        @Valid @RequestBody request: GoogleAuthRequest,
        requestHttp: HttpServletRequest
    ): ResponseEntity<*> {
        val deviceInfo = requestHttp.getHeader("User-Agent")
        val response = authService.googleAuth(request, deviceInfo)
        return ResponseEntity.ok(successResponse(response))
    }

    @Public
    @PostMapping("/refresh")
    @Operation(summary = "토큰 갱신")
    fun refreshTokens(
        @Valid @RequestBody request: RefreshTokenRequest,
        requestHttp: HttpServletRequest
    ): ResponseEntity<*> {
        val deviceInfo = requestHttp.getHeader("User-Agent")
        val response = authService.refreshTokens(request, deviceInfo)
        return ResponseEntity.ok(successResponse(response))
    }

    @PostMapping("/logout")
    @Operation(summary = "로그아웃")
    fun logout(
        @RequestBody request: Map<String, Any>?,
        @CurrentUser user: com.nestack.infrastructure.persistence.entity.User
    ): ResponseEntity<*> {
        val refreshToken = request?.get("refreshToken") as? String
        val allDevices = request?.get("allDevices") as? Boolean ?: false
        authService.logout(user.id, refreshToken, allDevices)
        return ResponseEntity.ok(successResponse(mapOf("message" to "로그아웃되었습니다.")))
    }

    @Public
    @PostMapping("/forgot-password")
    @Operation(summary = "비밀번호 찾기 (재설정 메일 발송)")
    fun forgotPassword(@Valid @RequestBody request: ForgotPasswordRequest): ResponseEntity<*> {
        val response = authService.forgotPassword(request)
        return ResponseEntity.ok(successResponse(response))
    }

    @Public
    @PostMapping("/reset-password")
    @Operation(summary = "비밀번호 재설정")
    fun resetPassword(@Valid @RequestBody request: ResetPasswordRequest): ResponseEntity<*> {
        val response = authService.resetPassword(request)
        return ResponseEntity.ok(successResponse(response))
    }
}
