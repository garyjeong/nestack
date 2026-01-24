package com.nestack.domain.mission.service

import com.nestack.common.constant.ErrorCode
import com.nestack.common.enum.CategoryStatus
import com.nestack.common.enum.MissionLevel
import com.nestack.common.enum.MissionStatus
import com.nestack.common.enum.MissionType
import com.nestack.common.exception.BusinessException
import com.nestack.domain.mission.dto.*
import com.nestack.infrastructure.persistence.entity.*
import com.nestack.infrastructure.persistence.repository.*
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.*

@Service
class MissionService(
    private val missionRepository: MissionRepository,
    private val missionTemplateRepository: MissionTemplateRepository,
    private val categoryRepository: LifeCycleCategoryRepository,
    private val transactionRepository: TransactionRepository
) {
    private val logger = LoggerFactory.getLogger(MissionService::class.java)

    @Transactional(readOnly = true)
    fun getCategories(): List<LifeCycleCategory> {
        return categoryRepository.findByStatusOrderByDisplayOrder(CategoryStatus.ACTIVE)
    }

    @Transactional(readOnly = true)
    fun getTemplates(categoryId: UUID?): List<MissionTemplate> {
        return if (categoryId != null) {
            missionTemplateRepository.findByCategoryIdAndStatus(categoryId, CategoryStatus.ACTIVE)
        } else {
            missionTemplateRepository.findAll()
                .filter { it.status == CategoryStatus.ACTIVE }
        }
    }

    @Transactional
    fun create(
        userId: UUID,
        request: CreateMissionRequest,
        familyGroupId: UUID?
    ): Mission {
        // Validate category
        val category = categoryRepository.findById(request.categoryId)
            .orElseThrow { BusinessException(ErrorCode.MISSION_001) }

        // If template is provided, use template defaults
        val template = request.templateId?.let {
            missionTemplateRepository.findById(it).orElse(null)
        }

        val mission = Mission().apply {
            this.userId = userId
            this.familyGroupId = familyGroupId
            this.templateId = request.templateId
            this.categoryId = request.categoryId
            this.parentMissionId = request.parentMissionId
            this.name = request.name
            this.description = request.description
            this.goalAmount = request.goalAmount
            this.missionType = request.missionType ?: MissionType.CUSTOM
            this.missionLevel = request.missionLevel ?: MissionLevel.MAIN
            this.startDate = request.startDate
            this.dueDate = request.dueDate
            this.status = MissionStatus.PENDING
            this.currentAmount = BigDecimal.ZERO
        }

        // If parent mission exists, validate it
        if (request.parentMissionId != null) {
            val parentMission = missionRepository.findByUserIdAndId(userId, request.parentMissionId)
                ?: throw BusinessException(ErrorCode.MISSION_003, mapOf(
                    "message" to "유효하지 않은 상위 미션입니다."
                ))
            mission.parentMission = parentMission
        }

        val savedMission = missionRepository.save(mission)

        // Update template usage count
        template?.let {
            it.usageCount++
            missionTemplateRepository.save(it)
        }

        return savedMission
    }

    @Transactional(readOnly = true)
    fun findAll(userId: UUID, query: MissionQueryRequest, familyGroupId: UUID?): List<Mission> {
        val missions = when {
            query.status != null -> missionRepository.findByUserIdAndStatus(userId, query.status)
            query.level != null -> missionRepository.findByUserIdAndMissionLevel(userId, query.level)
            query.categoryId != null -> missionRepository.findByUserIdAndCategoryId(userId, query.categoryId)
            query.parentMissionId != null -> missionRepository.findByUserIdAndParentMissionId(userId, query.parentMissionId)
            else -> missionRepository.findMainMissionsByUserId(userId)
        }

        return missions
    }

    @Transactional(readOnly = true)
    fun findById(missionId: UUID, userId: UUID): Mission {
        val mission = missionRepository.findByUserIdAndId(userId, missionId)
            ?: throw BusinessException(ErrorCode.MISSION_004)
        return mission
    }

    @Transactional
    fun update(missionId: UUID, userId: UUID, request: UpdateMissionRequest): Mission {
        val mission = findById(missionId, userId)

        request.name?.let { mission.name = it }
        request.description?.let { mission.description = it }
        request.goalAmount?.let { mission.goalAmount = it }
        request.startDate?.let { mission.startDate = it }
        request.dueDate?.let { mission.dueDate = it }

        return missionRepository.save(mission)
    }

    @Transactional
    fun updateStatus(missionId: UUID, userId: UUID, request: UpdateMissionStatusRequest): Mission {
        val mission = findById(missionId, userId)

        if (!isValidStatusTransition(mission.status, request.status)) {
            throw BusinessException(ErrorCode.MISSION_006, mapOf(
                "message" to "${mission.status}에서 ${request.status}로 상태를 변경할 수 없습니다."
            ))
        }

        mission.status = request.status

        if (request.status == MissionStatus.COMPLETED) {
            mission.completedAt = LocalDateTime.now()
        }

        return missionRepository.save(mission)
    }

    @Transactional
    fun delete(missionId: UUID, userId: UUID) {
        val mission = findById(missionId, userId)
        missionRepository.delete(mission)
    }

    @Transactional
    fun linkTransactions(missionId: UUID, userId: UUID, request: LinkTransactionRequest): Mission {
        val mission = findById(missionId, userId)

        val transactions = transactionRepository.findAllById(request.transactionIds)

        if (transactions.size != request.transactionIds.size) {
            throw BusinessException(ErrorCode.MISSION_007, mapOf(
                "message" to "일부 거래를 찾을 수 없습니다."
            ))
        }

        transactions.forEach { transaction ->
            transaction.missionId = mission.id
            transactionRepository.save(transaction)
        }

        recalculateMissionAmount(mission.id)

        return findById(missionId, userId)
    }

    @Transactional
    fun recalculateMissionAmount(missionId: UUID) {
        val transactions = transactionRepository.findByMissionId(missionId)
            .filter { it.type == com.nestack.common.enum.TransactionType.DEPOSIT }

        val currentAmount = transactions.sumOf { it.amount }

        val mission = missionRepository.findById(missionId).orElse(null)
        mission?.let {
            it.currentAmount = currentAmount
            missionRepository.save(it)

            // Auto-complete if goal reached
            if (currentAmount >= it.goalAmount && it.status == MissionStatus.IN_PROGRESS) {
                it.status = MissionStatus.COMPLETED
                it.completedAt = LocalDateTime.now()
                missionRepository.save(it)
            }
        }
    }

    @Transactional(readOnly = true)
    fun getProgressSummary(userId: UUID, familyGroupId: UUID?): ProgressSummary {
        val missions = missionRepository.findByUserIdAndMissionLevel(userId, MissionLevel.MAIN)

        val activeMissions = missions.filter { it.status == MissionStatus.IN_PROGRESS }
        val completedMissions = missions.filter { it.status == MissionStatus.COMPLETED }

        val totalGoalAmount = missions.sumOf { it.goalAmount }
        val totalCurrentAmount = missions.sumOf { it.currentAmount }

        val overallProgress = if (totalGoalAmount > BigDecimal.ZERO) {
            ((totalCurrentAmount.divide(totalGoalAmount, 4, java.math.RoundingMode.HALF_UP)) * BigDecimal(100)).toInt()
        } else {
            0
        }

        return ProgressSummary(
            totalMissions = missions.size,
            activeMissions = activeMissions.size,
            completedMissions = completedMissions.size,
            totalGoalAmount = totalGoalAmount,
            totalCurrentAmount = totalCurrentAmount,
            overallProgress = overallProgress
        )
    }

    private fun isValidStatusTransition(currentStatus: MissionStatus, newStatus: MissionStatus): Boolean {
        val validTransitions = mapOf(
            MissionStatus.PENDING to listOf(MissionStatus.IN_PROGRESS, MissionStatus.FAILED),
            MissionStatus.IN_PROGRESS to listOf(MissionStatus.COMPLETED, MissionStatus.FAILED, MissionStatus.PENDING),
            MissionStatus.COMPLETED to emptyList(),
            MissionStatus.FAILED to listOf(MissionStatus.PENDING)
        )

        return validTransitions[currentStatus]?.contains(newStatus) ?: false
    }

    data class ProgressSummary(
        val totalMissions: Int,
        val activeMissions: Int,
        val completedMissions: Int,
        val totalGoalAmount: BigDecimal,
        val totalCurrentAmount: BigDecimal,
        val overallProgress: Int
    )
}
