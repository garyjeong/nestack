package com.nestack.domain.badge.controller

import com.nestack.common.annotation.CurrentUser
import com.nestack.common.dto.successResponse
import com.nestack.domain.badge.service.BadgeService
import com.nestack.infrastructure.persistence.entity.User
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*

@Tag(name = "badges", description = "Badge management endpoints")
@RestController
@RequestMapping("/api/v1/badges")
class BadgeController(
    private val badgeService: BadgeService
) {

    @GetMapping
    @Operation(summary = "전체 뱃지 목록 조회")
    fun getAllBadges(): ResponseEntity<*> {
        val badges = badgeService.getAllBadges()
        return ResponseEntity.ok(successResponse(mapOf("badges" to badges)))
    }

    @GetMapping("/me")
    @Operation(summary = "내 뱃지 목록 조회 (획득/미획득 포함)")
    fun getMyBadges(@CurrentUser user: User): ResponseEntity<*> {
        val badges = badgeService.getUserBadgesWithStatus(user.id)
        val earnedCount = badges.count { it.earned }
        return ResponseEntity.ok(successResponse(mapOf(
            "badges" to badges,
            "earnedCount" to earnedCount,
            "totalCount" to badges.size
        )))
    }

    @GetMapping("/{id}")
    @Operation(summary = "뱃지 상세 조회")
    fun getBadgeById(@PathVariable id: UUID): ResponseEntity<*> {
        val badge = badgeService.getBadgeById(id)
        return ResponseEntity.ok(successResponse(mapOf("badge" to badge)))
    }
}
