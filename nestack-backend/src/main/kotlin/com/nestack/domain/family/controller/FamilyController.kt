package com.nestack.domain.family.controller

import com.nestack.common.annotation.CurrentUser
import com.nestack.common.dto.successResponse
import com.nestack.domain.family.dto.JoinFamilyRequest
import com.nestack.domain.family.dto.UpdateShareSettingsRequest
import com.nestack.domain.family.service.FamilyService
import com.nestack.infrastructure.persistence.entity.User
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@Tag(name = "family", description = "Family group management endpoints")
@RestController
@RequestMapping("/api/v1/family")
class FamilyController(
    private val familyService: FamilyService
) {

    @PostMapping("/create")
    @Operation(summary = "가족 그룹 생성")
    fun createFamilyGroup(@CurrentUser user: User): ResponseEntity<*> {
        val (familyGroup, inviteCode) = familyService.createFamilyGroup(user.id)
        return ResponseEntity.status(HttpStatus.CREATED).body(successResponse(mapOf(
            "familyGroup" to mapOf(
                "id" to familyGroup.id,
                "status" to familyGroup.status.name.lowercase(),
                "createdAt" to familyGroup.createdAt
            ),
            "inviteCode" to inviteCode,
            "message" to "가족 그룹이 생성되었습니다."
        )))
    }

    @GetMapping("/invite-code")
    @Operation(summary = "현재 초대 코드 조회")
    fun getInviteCode(@CurrentUser user: User): ResponseEntity<*> {
        val inviteCode = familyService.getActiveInviteCode(user.id)
        return ResponseEntity.ok(successResponse(mapOf(
            "inviteCode" to (inviteCode?.code ?: null),
            "expiresAt" to (inviteCode?.expiresAt ?: null)
        )))
    }

    @PostMapping("/invite-code/regenerate")
    @Operation(summary = "초대 코드 재발급")
    fun regenerateInviteCode(@CurrentUser user: User): ResponseEntity<*> {
        val inviteCode = familyService.regenerateInviteCode(user.id)
        return ResponseEntity.ok(successResponse(mapOf(
            "inviteCode" to inviteCode.code,
            "expiresAt" to inviteCode.expiresAt,
            "message" to "새 초대 코드가 발급되었습니다."
        )))
    }

    @PostMapping("/join")
    @Operation(summary = "가족 그룹 가입 (초대 코드 사용)")
    fun joinFamily(
        @CurrentUser user: User,
        @Valid @RequestBody request: JoinFamilyRequest
    ): ResponseEntity<*> {
        val familyGroup = familyService.joinFamily(user.id, request)
        return ResponseEntity.ok(successResponse(mapOf(
            "familyGroup" to mapOf(
                "id" to familyGroup.id,
                "status" to familyGroup.status.name.lowercase(),
                "createdAt" to familyGroup.createdAt,
                "memberCount" to familyGroup.members.size
            ),
            "message" to "가족 그룹에 가입되었습니다."
        )))
    }

    @GetMapping
    @Operation(summary = "가족 정보 조회")
    fun getFamilyInfo(@CurrentUser user: User): ResponseEntity<*> {
        val info = familyService.getFamilyInfo(user.id)

        if (info.familyGroup == null) {
            return ResponseEntity.ok(successResponse(mapOf(
                "hasFamily" to false,
                "familyGroup" to null,
                "partner" to null,
                "inviteCode" to null
            )))
        }

        return ResponseEntity.ok(successResponse(mapOf(
            "hasFamily" to true,
            "familyGroup" to mapOf(
                "id" to info.familyGroup.id,
                "status" to info.familyGroup.status.name.lowercase(),
                "createdAt" to info.familyGroup.createdAt,
                "memberCount" to info.familyGroup.members.size
            ),
            "partner" to info.partner,
            "inviteCode" to info.inviteCode
        )))
    }

    @DeleteMapping("/leave")
    @Operation(summary = "가족 그룹 탈퇴")
    fun leaveFamily(@CurrentUser user: User): ResponseEntity<*> {
        familyService.leaveFamily(user.id)
        return ResponseEntity.ok(successResponse(mapOf("message" to "가족 그룹에서 탈퇴하였습니다.")))
    }

    @GetMapping("/share-settings")
    @Operation(summary = "데이터 공유 설정 조회")
    fun getShareSettings(@CurrentUser user: User): ResponseEntity<*> {
        val accounts = familyService.getShareSettings(user.id)
        return ResponseEntity.ok(successResponse(mapOf("accounts" to accounts)))
    }

    @PatchMapping("/share-settings")
    @Operation(summary = "데이터 공유 설정 변경")
    fun updateShareSettings(
        @CurrentUser user: User,
        @Valid @RequestBody request: UpdateShareSettingsRequest
    ): ResponseEntity<*> {
        val updatedAccounts = familyService.updateShareSettings(user.id, request)
        return ResponseEntity.ok(successResponse(mapOf(
            "message" to "공유 설정이 변경되었습니다.",
            "updatedAccounts" to updatedAccounts
        )))
    }
}
