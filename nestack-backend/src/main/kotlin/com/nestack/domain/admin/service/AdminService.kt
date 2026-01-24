package com.nestack.domain.admin.service

import com.nestack.common.constant.ErrorCode
import com.nestack.common.enum.AdminRole
import com.nestack.common.enum.AdminStatus
import com.nestack.common.enum.MissionStatus
import com.nestack.common.enum.UserStatus
import com.nestack.common.exception.BusinessException
import com.nestack.common.util.CryptoUtil
import com.nestack.domain.admin.dto.*
import com.nestack.domain.badge.service.BadgeService
import com.nestack.infrastructure.persistence.entity.*
import com.nestack.infrastructure.persistence.repository.*
import com.nestack.infrastructure.security.JwtTokenProvider
import org.slf4j.LoggerFactory
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

@Service
class AdminService(
    private val adminUserRepository: AdminUserRepository,
    private val userRepository: UserRepository,
    private val familyGroupRepository: FamilyGroupRepository,
    private val missionRepository: MissionRepository,
    private val categoryRepository: LifeCycleCategoryRepository,
    private val templateRepository: MissionTemplateRepository,
    private val badgeRepository: BadgeRepository,
    private val userBadgeRepository: UserBadgeRepository,
    private val announcementRepository: AnnouncementRepository,
    private val jwtTokenProvider: JwtTokenProvider,
    private val badgeService: BadgeService
) {
    private val logger = LoggerFactory.getLogger(AdminService::class.java)

    @Transactional
    fun login(request: AdminLoginRequest): AdminLoginResponse {
        val admin = adminUserRepository.findByEmail(request.email)
            ?: throw BusinessException(ErrorCode.ADMIN_003)

        if (admin.status != AdminStatus.ACTIVE) {
            throw BusinessException(ErrorCode.ADMIN_001, mapOf(
                "message" to "비활성화된 관리자 계정입니다."
            ))
        }

        val isPasswordValid = CryptoUtil.verifyPassword(request.password, admin.passwordHash)
        if (!isPasswordValid) {
            throw BusinessException(ErrorCode.ADMIN_003)
        }

        // Update last login
        admin.lastLoginAt = LocalDateTime.now()
        adminUserRepository.save(admin)

        // Generate admin token
        val accessToken = jwtTokenProvider.generateAccessToken(admin.id.toString(), admin.email)

        return AdminLoginResponse(
            accessToken = accessToken,
            admin = AdminInfo(
                id = admin.id,
                email = admin.email,
                name = admin.name,
                role = admin.role
            )
        )
    }

    @Transactional(readOnly = true)
    fun getDashboardStats(): DashboardStats {
        val today = LocalDate.now().atStartOfDay()
        val firstDayOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay()

        val totalUsers = userRepository.count().toInt()
        val activeUsers = userRepository.findAll().count { it.status == UserStatus.ACTIVE }
        val newUsersToday = userRepository.findAll().count { it.createdAt.isAfter(today) }
        val newUsersThisMonth = userRepository.findAll().count { it.createdAt.isAfter(firstDayOfMonth) }
        val totalFamilyGroups = familyGroupRepository.count().toInt()
        val totalMissions = missionRepository.count().toInt()
        val completedMissions = missionRepository.findAll().count { it.status == MissionStatus.COMPLETED }
        val totalBadgesIssued = userBadgeRepository.count().toInt()

        val missionCompletionRate = if (totalMissions > 0) {
            ((completedMissions.toDouble() / totalMissions) * 100).toInt()
        } else {
            0
        }

        return DashboardStats(
            totalUsers = totalUsers,
            activeUsers = activeUsers,
            newUsersToday = newUsersToday,
            newUsersThisMonth = newUsersThisMonth,
            totalFamilyGroups = totalFamilyGroups,
            totalMissions = totalMissions,
            completedMissions = completedMissions,
            missionCompletionRate = missionCompletionRate,
            totalBadgesIssued = totalBadgesIssued
        )
    }

    @Transactional(readOnly = true)
    fun getUsers(query: UserQueryRequest): List<User> {
        var users = userRepository.findAll()

        query.search?.let { search ->
            users = users.filter {
                it.email.contains(search, ignoreCase = true) ||
                it.name.contains(search, ignoreCase = true)
            }
        }

        query.status?.let { status ->
            users = users.filter { it.status == status }
        }

        return users.sortedByDescending { it.createdAt }
    }

    @Transactional
    fun updateUserStatus(userId: UUID, status: UserStatus): User {
        val user = userRepository.findById(userId)
            .orElseThrow { BusinessException(ErrorCode.USER_003) }
        user.status = status
        return userRepository.save(user)
    }

    @Transactional(readOnly = true)
    fun getCategories(): List<LifeCycleCategory> {
        return categoryRepository.findAll().sortedBy { it.displayOrder }
    }

    @Transactional
    fun createCategory(request: CreateCategoryRequest): LifeCycleCategory {
        val category = LifeCycleCategory().apply {
            this.name = request.name
            this.displayOrder = request.displayOrder ?: 0
            this.status = com.nestack.common.enum.CategoryStatus.ACTIVE
        }
        return categoryRepository.save(category)
    }

    @Transactional
    fun updateCategory(categoryId: UUID, request: UpdateCategoryRequest): LifeCycleCategory {
        val category = categoryRepository.findById(categoryId)
            .orElseThrow { BusinessException(ErrorCode.MISSION_002) }

        request.name?.let { category.name = it }
        request.displayOrder?.let { category.displayOrder = it }
        request.status?.let { category.status = it }

        return categoryRepository.save(category)
    }

    @Transactional
    fun deleteCategory(categoryId: UUID) {
        val category = categoryRepository.findById(categoryId)
            .orElseThrow { BusinessException(ErrorCode.MISSION_002) }
        categoryRepository.delete(category)
    }

    @Transactional(readOnly = true)
    fun getTemplates(): List<MissionTemplate> {
        return templateRepository.findAll()
    }

    @Transactional
    fun createTemplate(request: CreateTemplateRequest): MissionTemplate {
        val template = MissionTemplate().apply {
            this.name = request.name
            this.description = request.description
            this.categoryId = request.categoryId
            this.goalType = request.goalType ?: com.nestack.common.enum.GoalType.AMOUNT
            this.defaultGoalAmount = request.defaultGoalAmount
            this.status = com.nestack.common.enum.CategoryStatus.ACTIVE
        }
        return templateRepository.save(template)
    }

    @Transactional
    fun updateTemplate(templateId: UUID, request: UpdateTemplateRequest): MissionTemplate {
        val template = templateRepository.findById(templateId)
            .orElseThrow { BusinessException(ErrorCode.MISSION_002) }

        request.name?.let { template.name = it }
        request.description?.let { template.description = it }
        request.goalType?.let { template.goalType = it }
        request.defaultGoalAmount?.let { template.defaultGoalAmount = it }
        request.status?.let { template.status = it }

        return templateRepository.save(template)
    }

    @Transactional
    fun deleteTemplate(templateId: UUID) {
        val template = templateRepository.findById(templateId)
            .orElseThrow { BusinessException(ErrorCode.MISSION_002) }
        templateRepository.delete(template)
    }

    @Transactional(readOnly = true)
    fun getBadges(): List<Badge> {
        return badgeRepository.findAll()
    }

    @Transactional
    fun createBadge(request: CreateBadgeRequest): Badge {
        val badge = Badge().apply {
            this.name = request.name
            this.description = request.description
            this.imageUrl = request.imageUrl
            this.badgeType = request.badgeType
            this.conditionType = request.conditionType
            this.conditionValue = request.conditionValue
            this.status = com.nestack.common.enum.CategoryStatus.ACTIVE
        }
        return badgeRepository.save(badge)
    }

    @Transactional
    fun updateBadge(badgeId: UUID, request: UpdateBadgeRequest): Badge {
        val badge = badgeRepository.findById(badgeId)
            .orElseThrow { BusinessException(ErrorCode.BADGE_001) }

        request.name?.let { badge.name = it }
        request.description?.let { badge.description = it }
        request.imageUrl?.let { badge.imageUrl = it }
        request.conditionType?.let { badge.conditionType = it }
        request.conditionValue?.let { badge.conditionValue = it }
        request.status?.let { badge.status = it }

        return badgeRepository.save(badge)
    }

    @Transactional
    fun deleteBadge(badgeId: UUID) {
        val badge = badgeRepository.findById(badgeId)
            .orElseThrow { BusinessException(ErrorCode.BADGE_001) }
        badgeRepository.delete(badge)
    }

    @Transactional
    fun issueBadge(adminId: UUID, request: IssueBadgeRequest) {
        badgeService.awardBadge(
            userId = request.userId,
            badgeId = request.badgeId,
            issueType = com.nestack.common.enum.BadgeIssueType.MANUAL,
            issuedBy = adminId
        )
    }

    @Transactional(readOnly = true)
    fun getAnnouncements(): List<Announcement> {
        return announcementRepository.findAll().sortedByDescending { it.createdAt }
    }

    @Transactional
    fun createAnnouncement(adminId: UUID, request: CreateAnnouncementRequest): Announcement {
        val announcement = Announcement().apply {
            this.title = request.title
            this.content = request.content
            this.displayType = request.displayType
            this.startDate = request.startDate
            this.endDate = request.endDate
            this.status = com.nestack.common.enum.AnnouncementStatus.ACTIVE
            this.createdBy = adminId
        }
        return announcementRepository.save(announcement)
    }

    @Transactional
    fun updateAnnouncement(announcementId: UUID, request: UpdateAnnouncementRequest): Announcement {
        val announcement = announcementRepository.findById(announcementId)
            .orElseThrow { BusinessException(ErrorCode.COMMON_001) }

        request.title?.let { announcement.title = it }
        request.content?.let { announcement.content = it }
        request.displayType?.let { announcement.displayType = it }
        request.startDate?.let { announcement.startDate = it }
        request.endDate?.let { announcement.endDate = it }
        request.status?.let { announcement.status = it }

        return announcementRepository.save(announcement)
    }

    @Transactional
    fun deleteAnnouncement(announcementId: UUID) {
        val announcement = announcementRepository.findById(announcementId)
            .orElseThrow { BusinessException(ErrorCode.COMMON_001) }
        announcementRepository.delete(announcement)
    }

    @Transactional(readOnly = true)
    fun getActiveAnnouncements(): List<Announcement> {
        val now = LocalDateTime.now()
        return announcementRepository.findActiveAnnouncements(
            com.nestack.common.enum.AnnouncementStatus.ACTIVE,
            now
        )
    }

    data class DashboardStats(
        val totalUsers: Int,
        val activeUsers: Int,
        val newUsersToday: Int,
        val newUsersThisMonth: Int,
        val totalFamilyGroups: Int,
        val totalMissions: Int,
        val completedMissions: Int,
        val missionCompletionRate: Int,
        val totalBadgesIssued: Int
    )
}
