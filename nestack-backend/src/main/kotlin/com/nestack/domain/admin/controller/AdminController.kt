package com.nestack.domain.admin.controller

import com.nestack.common.annotation.Public
import com.nestack.common.dto.successResponse
import com.nestack.domain.admin.dto.*
import com.nestack.domain.admin.service.AdminService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*

@Tag(name = "Admin", description = "Admin management endpoints")
@RestController
@RequestMapping("/api/v1/admin")
class AdminController(
    private val adminService: AdminService
) {

    @Public
    @PostMapping("/login")
    @Operation(summary = "관리자 로그인")
    fun login(@Valid @RequestBody request: AdminLoginRequest): ResponseEntity<*> {
        val response = adminService.login(request)
        return ResponseEntity.ok(successResponse(response))
    }

    @GetMapping("/dashboard")
    @Operation(summary = "대시보드 통계")
    fun getDashboard(): ResponseEntity<*> {
        val stats = adminService.getDashboardStats()
        return ResponseEntity.ok(successResponse(stats))
    }

    @GetMapping("/users")
    @Operation(summary = "사용자 목록 조회")
    fun getUsers(
        @RequestParam(required = false) search: String?,
        @RequestParam(required = false) status: String?,
        @RequestParam(required = false, defaultValue = "1") page: Int,
        @RequestParam(required = false, defaultValue = "20") limit: Int
    ): ResponseEntity<*> {
        val query = UserQueryRequest(
            search = search,
            status = status?.let { com.nestack.common.enum.UserStatus.valueOf(it.uppercase()) },
            page = page,
            limit = limit
        )
        val users = adminService.getUsers(query)
        return ResponseEntity.ok(successResponse(mapOf("users" to users)))
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "사용자 상태 변경")
    fun updateUserStatus(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateUserStatusRequest
    ): ResponseEntity<*> {
        val user = adminService.updateUserStatus(id, request.status)
        return ResponseEntity.ok(successResponse(user))
    }

    @GetMapping("/categories")
    @Operation(summary = "카테고리 목록 조회")
    fun getCategories(): ResponseEntity<*> {
        val categories = adminService.getCategories()
        return ResponseEntity.ok(successResponse(mapOf("categories" to categories)))
    }

    @PostMapping("/categories")
    @Operation(summary = "카테고리 생성")
    fun createCategory(@Valid @RequestBody request: CreateCategoryRequest): ResponseEntity<*> {
        val category = adminService.createCategory(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(successResponse(category))
    }

    @PatchMapping("/categories/{id}")
    @Operation(summary = "카테고리 수정")
    fun updateCategory(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateCategoryRequest
    ): ResponseEntity<*> {
        val category = adminService.updateCategory(id, request)
        return ResponseEntity.ok(successResponse(category))
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "카테고리 삭제")
    fun deleteCategory(@PathVariable id: UUID): ResponseEntity<*> {
        adminService.deleteCategory(id)
        return ResponseEntity.noContent().build<Any>()
    }

    @GetMapping("/templates")
    @Operation(summary = "템플릿 목록 조회")
    fun getTemplates(): ResponseEntity<*> {
        val templates = adminService.getTemplates()
        return ResponseEntity.ok(successResponse(mapOf("templates" to templates)))
    }

    @PostMapping("/templates")
    @Operation(summary = "템플릿 생성")
    fun createTemplate(@Valid @RequestBody request: CreateTemplateRequest): ResponseEntity<*> {
        val template = adminService.createTemplate(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(successResponse(template))
    }

    @PatchMapping("/templates/{id}")
    @Operation(summary = "템플릿 수정")
    fun updateTemplate(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateTemplateRequest
    ): ResponseEntity<*> {
        val template = adminService.updateTemplate(id, request)
        return ResponseEntity.ok(successResponse(template))
    }

    @DeleteMapping("/templates/{id}")
    @Operation(summary = "템플릿 삭제")
    fun deleteTemplate(@PathVariable id: UUID): ResponseEntity<*> {
        adminService.deleteTemplate(id)
        return ResponseEntity.noContent().build<Any>()
    }

    @GetMapping("/badges")
    @Operation(summary = "뱃지 목록 조회")
    fun getBadges(): ResponseEntity<*> {
        val badges = adminService.getBadges()
        return ResponseEntity.ok(successResponse(mapOf("badges" to badges)))
    }

    @PostMapping("/badges")
    @Operation(summary = "뱃지 생성")
    fun createBadge(@Valid @RequestBody request: CreateBadgeRequest): ResponseEntity<*> {
        val badge = adminService.createBadge(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(successResponse(badge))
    }

    @PatchMapping("/badges/{id}")
    @Operation(summary = "뱃지 수정")
    fun updateBadge(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateBadgeRequest
    ): ResponseEntity<*> {
        val badge = adminService.updateBadge(id, request)
        return ResponseEntity.ok(successResponse(badge))
    }

    @DeleteMapping("/badges/{id}")
    @Operation(summary = "뱃지 삭제")
    fun deleteBadge(@PathVariable id: UUID): ResponseEntity<*> {
        adminService.deleteBadge(id)
        return ResponseEntity.noContent().build<Any>()
    }

    @PostMapping("/badges/issue")
    @Operation(summary = "뱃지 수동 발급")
    fun issueBadge(
        request: HttpServletRequest,
        @Valid @RequestBody issueRequest: IssueBadgeRequest
    ): ResponseEntity<*> {
        val adminId = request.getAttribute("adminId") as? String
            ?: throw IllegalStateException("Admin ID not found")
        adminService.issueBadge(UUID.fromString(adminId), issueRequest)
        return ResponseEntity.ok(successResponse(mapOf("message" to "뱃지가 발급되었습니다.")))
    }

    @GetMapping("/announcements")
    @Operation(summary = "공지사항 목록 조회")
    fun getAnnouncements(): ResponseEntity<*> {
        val announcements = adminService.getAnnouncements()
        return ResponseEntity.ok(successResponse(mapOf("announcements" to announcements)))
    }

    @PostMapping("/announcements")
    @Operation(summary = "공지사항 생성")
    fun createAnnouncement(
        request: HttpServletRequest,
        @Valid @RequestBody createRequest: CreateAnnouncementRequest
    ): ResponseEntity<*> {
        val adminId = request.getAttribute("adminId") as? String
            ?: throw IllegalStateException("Admin ID not found")
        val announcement = adminService.createAnnouncement(UUID.fromString(adminId), createRequest)
        return ResponseEntity.status(HttpStatus.CREATED).body(successResponse(announcement))
    }

    @PatchMapping("/announcements/{id}")
    @Operation(summary = "공지사항 수정")
    fun updateAnnouncement(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateAnnouncementRequest
    ): ResponseEntity<*> {
        val announcement = adminService.updateAnnouncement(id, request)
        return ResponseEntity.ok(successResponse(announcement))
    }

    @DeleteMapping("/announcements/{id}")
    @Operation(summary = "공지사항 삭제")
    fun deleteAnnouncement(@PathVariable id: UUID): ResponseEntity<*> {
        adminService.deleteAnnouncement(id)
        return ResponseEntity.noContent().build<Any>()
    }

    @Public
    @GetMapping("/announcements/active")
    @Operation(summary = "활성 공지사항 조회 (공개)")
    fun getActiveAnnouncements(): ResponseEntity<*> {
        val announcements = adminService.getActiveAnnouncements()
        return ResponseEntity.ok(successResponse(mapOf("announcements" to announcements)))
    }
}
