package com.nestack.domain.badge.service

import com.nestack.common.constant.ErrorCode
import com.nestack.common.enum.BadgeIssueType
import com.nestack.common.enum.BadgeType
import com.nestack.common.enum.CategoryStatus
import com.nestack.common.enum.MissionStatus
import com.nestack.common.exception.BusinessException
import com.nestack.infrastructure.persistence.entity.Badge
import com.nestack.infrastructure.persistence.entity.UserBadge
import com.nestack.infrastructure.persistence.repository.BadgeRepository
import com.nestack.infrastructure.persistence.repository.MissionRepository
import com.nestack.infrastructure.persistence.repository.UserBadgeRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Service
class BadgeService(
    private val badgeRepository: BadgeRepository,
    private val userBadgeRepository: UserBadgeRepository,
    private val missionRepository: MissionRepository
) {
    private val logger = LoggerFactory.getLogger(BadgeService::class.java)

    @Transactional(readOnly = true)
    fun getAllBadges(): List<Badge> {
        return badgeRepository.findByStatus(CategoryStatus.ACTIVE)
            .sortedWith(compareBy<Badge> { it.badgeType }.thenBy { it.createdAt })
    }

    @Transactional(readOnly = true)
    fun getBadgeById(badgeId: UUID): Badge {
        return badgeRepository.findById(badgeId)
            .orElseThrow { BusinessException(ErrorCode.BADGE_001) }
    }

    @Transactional(readOnly = true)
    fun getUserBadges(userId: UUID): List<UserBadge> {
        return userBadgeRepository.findByUserId(userId)
            .sortedByDescending { it.issuedAt }
    }

    @Transactional(readOnly = true)
    fun getUserBadgesWithStatus(userId: UUID): List<BadgeWithStatus> {
        val allBadges = getAllBadges()
        val userBadges = getUserBadges(userId)
        val userBadgeMap = userBadges.associateBy { it.badgeId }

        return allBadges.map { badge ->
            val userBadge = userBadgeMap[badge.id]
            BadgeWithStatus(
                badge = badge,
                earned = userBadge != null,
                earnedAt = userBadge?.issuedAt
            )
        }
    }

    @Transactional
    fun awardBadge(
        userId: UUID,
        badgeId: UUID,
        issueType: BadgeIssueType = BadgeIssueType.AUTO,
        issuedBy: UUID? = null
    ): UserBadge {
        val badge = getBadgeById(badgeId)

        val existingBadge = userBadgeRepository.findByUserIdAndBadgeId(userId, badgeId)
        if (existingBadge != null) {
            throw BusinessException(ErrorCode.BADGE_002)
        }

        val userBadge = UserBadge().apply {
            this.userId = userId
            this.badgeId = badgeId
            this.issueType = issueType
            this.issuedBy = issuedBy
        }

        return userBadgeRepository.save(userBadge)
    }

    @Transactional
    fun checkLifecycleBadges(userId: UUID, categoryId: UUID) {
        val completedCount = missionRepository.findByUserId(userId)
            .count { it.categoryId == categoryId && it.status == MissionStatus.COMPLETED }

        val lifecycleBadges = badgeRepository.findByStatus(CategoryStatus.ACTIVE)
            .filter { it.badgeType == BadgeType.LIFECYCLE }

        lifecycleBadges.forEach { badge ->
            val condition = badge.conditionValue
            val badgeCategoryId = condition["categoryId"] as? String

            if (badgeCategoryId == categoryId.toString()) {
                val requiredCount = (condition["completedCount"] as? Number)?.toInt()
                if (requiredCount != null && completedCount >= requiredCount) {
                    try {
                        awardBadge(userId, badge.id)
                        logger.info("Awarded lifecycle badge ${badge.name} to user $userId")
                    } catch (e: BusinessException) {
                        // Badge already earned, ignore
                    }
                }
            }
        }
    }

    @Transactional
    fun checkStreakBadges(userId: UUID) {
        val missions = missionRepository.findByUserId(userId)
            .filter { it.status == MissionStatus.COMPLETED && it.completedAt != null }
            .sortedByDescending { it.completedAt }

        // Calculate consecutive months (simplified)
        var consecutiveMonths = 0
        var currentMonth = java.time.LocalDate.now().monthValue
        var currentYear = java.time.LocalDate.now().year

        missions.forEach { mission ->
            mission.completedAt?.let { completedAt ->
                val missionMonth = completedAt.monthValue
                val missionYear = completedAt.year

                if (missionMonth == currentMonth && missionYear == currentYear) {
                    return@forEach
                }

                val prevMonth = if (currentMonth == 1) 12 else currentMonth - 1
                val prevYear = if (currentMonth == 1) currentYear - 1 else currentYear

                if (missionMonth == prevMonth && missionYear == prevYear) {
                    consecutiveMonths++
                    currentMonth = prevMonth
                    currentYear = prevYear
                } else {
                    return@forEach
                }
            }
        }

        val streakBadges = badgeRepository.findByStatus(CategoryStatus.ACTIVE)
            .filter { it.badgeType == BadgeType.STREAK }

        streakBadges.forEach { badge ->
            val condition = badge.conditionValue
            val requiredMonths = (condition["consecutiveMonths"] as? Number)?.toInt()
            if (requiredMonths != null && consecutiveMonths >= requiredMonths) {
                try {
                    awardBadge(userId, badge.id)
                    logger.info("Awarded streak badge ${badge.name} to user $userId")
                } catch (e: BusinessException) {
                    // Badge already earned, ignore
                }
            }
        }
    }

    @Transactional
    fun checkFamilyBadges(userId: UUID, familyGroupId: UUID) {
        val familyCompletedCount = missionRepository.findByFamilyGroupId(familyGroupId)
            .count { it.status == MissionStatus.COMPLETED }

        val familyBadges = badgeRepository.findByStatus(CategoryStatus.ACTIVE)
            .filter { it.badgeType == BadgeType.FAMILY }

        familyBadges.forEach { badge ->
            val condition = badge.conditionValue
            val requiredCount = (condition["familyCompletedCount"] as? Number)?.toInt()
            if (requiredCount != null && familyCompletedCount >= requiredCount) {
                try {
                    awardBadge(userId, badge.id)
                    logger.info("Awarded family badge ${badge.name} to user $userId")
                } catch (e: BusinessException) {
                    // Badge already earned, ignore
                }
            }
        }
    }

    data class BadgeWithStatus(
        val badge: Badge,
        val earned: Boolean,
        val earnedAt: java.time.LocalDateTime?
    )
}
