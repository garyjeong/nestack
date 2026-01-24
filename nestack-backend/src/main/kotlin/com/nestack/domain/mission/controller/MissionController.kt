package com.nestack.domain.mission.controller

import com.nestack.common.annotation.CurrentUser
import com.nestack.common.dto.successResponse
import com.nestack.domain.mission.dto.*
import com.nestack.domain.mission.service.MissionService
import com.nestack.infrastructure.persistence.entity.User
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*

@Tag(name = "missions", description = "Mission management endpoints")
@RestController
@RequestMapping("/api/v1/missions")
class MissionController(
    private val missionService: MissionService
) {

    @GetMapping("/categories")
    @Operation(summary = "생애주기 카테고리 목록 조회")
    fun getCategories(): ResponseEntity<*> {
        val categories = missionService.getCategories()
        return ResponseEntity.ok(successResponse(mapOf("categories" to categories)))
    }

    @GetMapping("/templates")
    @Operation(summary = "미션 템플릿 목록 조회")
    fun getTemplates(
        @Parameter(description = "카테고리 ID")
        @RequestParam(required = false) categoryId: UUID?
    ): ResponseEntity<*> {
        val templates = missionService.getTemplates(categoryId)
        return ResponseEntity.ok(successResponse(mapOf("templates" to templates)))
    }

    @PostMapping
    @Operation(summary = "미션 생성")
    fun create(
        @CurrentUser user: User,
        @Valid @RequestBody request: CreateMissionRequest
    ): ResponseEntity<*> {
        val mission = missionService.create(user.id, request, user.familyGroupId)
        return ResponseEntity.status(HttpStatus.CREATED).body(successResponse(mapOf(
            "mission" to mission,
            "message" to "미션이 생성되었습니다."
        )))
    }

    @GetMapping
    @Operation(summary = "미션 목록 조회")
    fun findAll(
        @CurrentUser user: User,
        @RequestParam(required = false) status: String?,
        @RequestParam(required = false) level: String?,
        @RequestParam(required = false) categoryId: UUID?,
        @RequestParam(required = false) parentMissionId: UUID?
    ): ResponseEntity<*> {
        val query = MissionQueryRequest(
            status = status?.let { com.nestack.common.enum.MissionStatus.valueOf(it.uppercase()) },
            level = level?.let { com.nestack.common.enum.MissionLevel.valueOf(it.uppercase()) },
            categoryId = categoryId,
            parentMissionId = parentMissionId
        )
        val missions = missionService.findAll(user.id, query, user.familyGroupId)
        return ResponseEntity.ok(successResponse(mapOf("missions" to missions)))
    }

    @GetMapping("/summary")
    @Operation(summary = "미션 진행 요약 조회")
    fun getProgressSummary(@CurrentUser user: User): ResponseEntity<*> {
        val summary = missionService.getProgressSummary(user.id, user.familyGroupId)
        return ResponseEntity.ok(successResponse(mapOf("summary" to summary)))
    }

    @GetMapping("/{id}")
    @Operation(summary = "미션 상세 조회")
    fun findOne(
        @CurrentUser user: User,
        @PathVariable id: UUID
    ): ResponseEntity<*> {
        val mission = missionService.findById(id, user.id)
        return ResponseEntity.ok(successResponse(mapOf("mission" to mission)))
    }

    @PatchMapping("/{id}")
    @Operation(summary = "미션 수정")
    fun update(
        @CurrentUser user: User,
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateMissionRequest
    ): ResponseEntity<*> {
        val mission = missionService.update(id, user.id, request)
        return ResponseEntity.ok(successResponse(mapOf("mission" to mission)))
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "미션 상태 변경")
    fun updateStatus(
        @CurrentUser user: User,
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateMissionStatusRequest
    ): ResponseEntity<*> {
        val mission = missionService.updateStatus(id, user.id, request)
        return ResponseEntity.ok(successResponse(mapOf("mission" to mission)))
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "미션 삭제")
    fun delete(
        @CurrentUser user: User,
        @PathVariable id: UUID
    ): ResponseEntity<*> {
        missionService.delete(id, user.id)
        return ResponseEntity.ok(successResponse(mapOf("message" to "미션이 삭제되었습니다.")))
    }

    @PostMapping("/{id}/transactions")
    @Operation(summary = "거래 연결")
    fun linkTransactions(
        @CurrentUser user: User,
        @PathVariable id: UUID,
        @Valid @RequestBody request: LinkTransactionRequest
    ): ResponseEntity<*> {
        val mission = missionService.linkTransactions(id, user.id, request)
        return ResponseEntity.ok(successResponse(mapOf("mission" to mission)))
    }
}
