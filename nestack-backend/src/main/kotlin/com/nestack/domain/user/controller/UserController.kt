package com.nestack.domain.user.controller

import com.nestack.common.annotation.CurrentUser
import com.nestack.common.dto.successResponse
import com.nestack.domain.user.dto.ChangePasswordRequest
import com.nestack.domain.user.dto.UpdateProfileRequest
import com.nestack.domain.user.service.UserService
import com.nestack.infrastructure.persistence.entity.User
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@Tag(name = "users", description = "User management endpoints")
@RestController
@RequestMapping("/api/v1/users")
class UserController(
    private val userService: UserService
) {

    @GetMapping("/me")
    @Operation(summary = "내 정보 조회")
    fun getMe(@CurrentUser user: User): ResponseEntity<*> {
        val profile = userService.getProfile(user.id)
        return ResponseEntity.ok(successResponse(formatUserResponse(profile)))
    }

    @PatchMapping("/me")
    @Operation(summary = "내 정보 수정")
    fun updateMe(
        @CurrentUser user: User,
        @Valid @RequestBody request: UpdateProfileRequest
    ): ResponseEntity<*> {
        val updatedUser = userService.updateProfile(user.id, request.name, request.profileImageUrl)
        return ResponseEntity.ok(successResponse(formatUserResponse(updatedUser)))
    }

    @PatchMapping("/me/password")
    @Operation(summary = "비밀번호 변경")
    fun changePassword(
        @CurrentUser user: User,
        @Valid @RequestBody request: ChangePasswordRequest
    ): ResponseEntity<*> {
        userService.changePassword(user.id, request.currentPassword, request.newPassword)
        return ResponseEntity.ok(successResponse(mapOf("message" to "비밀번호가 변경되었습니다.")))
    }

    @DeleteMapping("/me")
    @Operation(summary = "회원 탈퇴")
    fun withdraw(
        @CurrentUser user: User,
        @RequestBody body: Map<String, String>
    ): ResponseEntity<*> {
        val password = body["password"] ?: throw IllegalArgumentException("Password is required")
        userService.withdraw(user.id, password)
        return ResponseEntity.ok(successResponse(mapOf("message" to "회원 탈퇴가 완료되었습니다.")))
    }

    private fun formatUserResponse(user: User): Map<String, Any?> {
        val familyGroupInfo = user.familyGroup?.let { fg ->
            val partner = fg.members.find { it.id != user.id }
            mapOf(
                "id" to fg.id,
                "createdAt" to fg.createdAt,
                "partner" to (partner?.let {
                    mapOf(
                        "id" to it.id,
                        "name" to it.name,
                        "profileImageUrl" to it.profileImageUrl
                    )
                } ?: null)
            )
        }

        return mapOf(
            "id" to user.id,
            "email" to user.email,
            "name" to user.name,
            "profileImageUrl" to user.profileImageUrl,
            "provider" to user.provider.name.lowercase(),
            "emailVerified" to user.emailVerified,
            "status" to user.status.name.lowercase(),
            "familyGroup" to familyGroupInfo,
            "createdAt" to user.createdAt
        )
    }
}
