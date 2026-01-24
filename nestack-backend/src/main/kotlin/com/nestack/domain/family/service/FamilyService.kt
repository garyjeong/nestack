package com.nestack.domain.family.service

import com.nestack.common.constant.Defaults
import com.nestack.common.constant.ErrorCode
import com.nestack.common.enum.FamilyGroupStatus
import com.nestack.common.enum.InviteCodeStatus
import com.nestack.common.exception.BusinessException
import com.nestack.common.util.InviteCodeUtil
import com.nestack.domain.family.dto.JoinFamilyRequest
import com.nestack.domain.family.dto.UpdateShareSettingsRequest
import com.nestack.domain.user.service.UserService
import com.nestack.infrastructure.persistence.entity.BankAccount
import com.nestack.infrastructure.persistence.entity.FamilyGroup
import com.nestack.infrastructure.persistence.entity.InviteCode
import com.nestack.infrastructure.persistence.entity.User
import com.nestack.infrastructure.persistence.repository.BankAccountRepository
import com.nestack.infrastructure.persistence.repository.FamilyGroupRepository
import com.nestack.infrastructure.persistence.repository.InviteCodeRepository
import com.nestack.infrastructure.persistence.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.*

@Service
class FamilyService(
    private val familyGroupRepository: FamilyGroupRepository,
    private val inviteCodeRepository: InviteCodeRepository,
    private val userRepository: UserRepository,
    private val bankAccountRepository: BankAccountRepository,
    private val userService: UserService
) {
    private val logger = LoggerFactory.getLogger(FamilyService::class.java)

    @Transactional
    fun createFamilyGroup(userId: UUID): Pair<FamilyGroup, String> {
        val user = userRepository.findById(userId)
            .orElseThrow { BusinessException(ErrorCode.USER_003) }

        if (user.familyGroupId != null) {
            throw BusinessException(ErrorCode.FAMILY_001, mapOf(
                "message" to "이미 가족 그룹에 속해 있습니다."
            ))
        }

        val familyGroup = FamilyGroup().apply {
            createdBy = userId
            status = FamilyGroupStatus.ACTIVE
        }
        val savedFamilyGroup = familyGroupRepository.save(familyGroup)

        userService.updateFamilyGroup(userId, savedFamilyGroup.id)

        val inviteCode = createInviteCode(userId, savedFamilyGroup.id)

        return Pair(savedFamilyGroup, inviteCode.code)
    }

    @Transactional
    fun createInviteCode(userId: UUID, familyGroupId: UUID): InviteCode {
        // Expire existing pending codes
        val existingCodes = inviteCodeRepository.findAll()
            .filter { it.familyGroupId == familyGroupId && it.status == InviteCodeStatus.PENDING }
        existingCodes.forEach { code ->
            code.status = InviteCodeStatus.EXPIRED
            inviteCodeRepository.save(code)
        }

        // Generate unique code
        var code: String
        var attempts = 0
        val maxAttempts = 10

        do {
            code = InviteCodeUtil.generate()
            val existing = inviteCodeRepository.findByCode(code)
            if (existing == null) break
            attempts++
        } while (attempts < maxAttempts)

        if (attempts >= maxAttempts) {
            throw BusinessException(ErrorCode.FAMILY_002, mapOf(
                "message" to "초대 코드 생성에 실패했습니다. 다시 시도해주세요."
            ))
        }

        val inviteCode = InviteCode().apply {
            this.code = code
            this.familyGroupId = familyGroupId
            this.createdBy = userId
            this.status = InviteCodeStatus.PENDING
            this.expiresAt = LocalDateTime.now().plusDays(Defaults.INVITE_CODE_EXPIRY_DAYS.toLong())
        }

        return inviteCodeRepository.save(inviteCode)
    }

    @Transactional(readOnly = true)
    fun getActiveInviteCode(userId: UUID): InviteCode? {
        val user = userRepository.findById(userId).orElse(null)
        val familyGroupId = user?.familyGroupId ?: return null

        val inviteCode = inviteCodeRepository.findLatestByFamilyGroupIdAndStatus(
            familyGroupId,
            InviteCodeStatus.PENDING
        )

        if (inviteCode != null && inviteCode.expiresAt.isBefore(LocalDateTime.now())) {
            inviteCode.status = InviteCodeStatus.EXPIRED
            inviteCodeRepository.save(inviteCode)
            return null
        }

        return inviteCode
    }

    @Transactional
    fun regenerateInviteCode(userId: UUID): InviteCode {
        val user = userRepository.findById(userId).orElse(null)
        val familyGroupId = user?.familyGroupId
            ?: throw BusinessException(ErrorCode.FAMILY_006, mapOf(
                "message" to "가족 그룹에 속해 있지 않습니다."
            ))

        return createInviteCode(userId, familyGroupId)
    }

    @Transactional
    fun joinFamily(userId: UUID, request: JoinFamilyRequest): FamilyGroup {
        val user = userRepository.findById(userId)
            .orElseThrow { BusinessException(ErrorCode.USER_003) }

        if (user.familyGroupId != null) {
            throw BusinessException(ErrorCode.FAMILY_001, mapOf(
                "message" to "이미 가족 그룹에 속해 있습니다."
            ))
        }

        val normalizedCode = InviteCodeUtil.normalize(request.inviteCode)
        val inviteCode = inviteCodeRepository.findByCode(normalizedCode)
            ?: throw BusinessException(ErrorCode.FAMILY_002, mapOf(
                "message" to "유효하지 않은 초대 코드입니다."
            ))

        if (inviteCode.status != InviteCodeStatus.PENDING) {
            throw BusinessException(ErrorCode.FAMILY_004, mapOf(
                "message" to "이미 사용되었거나 만료된 초대 코드입니다."
            ))
        }

        if (inviteCode.expiresAt.isBefore(LocalDateTime.now())) {
            inviteCode.status = InviteCodeStatus.EXPIRED
            inviteCodeRepository.save(inviteCode)
            throw BusinessException(ErrorCode.FAMILY_003, mapOf(
                "message" to "만료된 초대 코드입니다."
            ))
        }

        val familyGroup = familyGroupRepository.findById(inviteCode.familyGroupId)
            .orElseThrow { BusinessException(ErrorCode.FAMILY_006) }

        if (familyGroup.status != FamilyGroupStatus.ACTIVE) {
            throw BusinessException(ErrorCode.FAMILY_005, mapOf(
                "message" to "비활성화된 가족 그룹입니다."
            ))
        }

        val memberCount = userRepository.findByFamilyGroupId(inviteCode.familyGroupId).size
        if (memberCount >= Defaults.MAX_FAMILY_MEMBERS) {
            throw BusinessException(ErrorCode.FAMILY_005, mapOf(
                "message" to "가족 그룹이 이미 가득 찼습니다. (최대 ${Defaults.MAX_FAMILY_MEMBERS}명)"
            ))
        }

        userService.updateFamilyGroup(userId, inviteCode.familyGroupId)

        inviteCode.status = InviteCodeStatus.USED
        inviteCode.usedBy = userId
        inviteCode.usedAt = LocalDateTime.now()
        inviteCodeRepository.save(inviteCode)

        return getFamilyGroup(inviteCode.familyGroupId)
    }

    @Transactional(readOnly = true)
    fun getFamilyGroup(familyGroupId: UUID): FamilyGroup {
        return familyGroupRepository.findById(familyGroupId)
            .orElseThrow { BusinessException(ErrorCode.FAMILY_006) }
    }

    @Transactional(readOnly = true)
    fun getFamilyInfo(userId: UUID): FamilyInfo {
        val user = userRepository.findById(userId).orElse(null)
        val familyGroupId = user?.familyGroupId ?: return FamilyInfo(null, null, null)

        val familyGroup = getFamilyGroup(familyGroupId)
        val partner = familyGroup.members.find { it.id != user.id }
        val partnerInfo = partner?.let {
            mapOf(
                "id" to it.id,
                "name" to it.name,
                "email" to it.email,
                "profileImageUrl" to it.profileImageUrl
            )
        }

        val inviteCode = if (familyGroup.members.size < Defaults.MAX_FAMILY_MEMBERS) {
            getActiveInviteCode(userId)?.code
        } else {
            null
        }

        return FamilyInfo(familyGroup, partnerInfo, inviteCode)
    }

    @Transactional
    fun leaveFamily(userId: UUID) {
        val user = userRepository.findById(userId).orElse(null)
        if (user?.familyGroupId == null) {
            throw BusinessException(ErrorCode.FAMILY_006, mapOf(
                "message" to "가족 그룹에 속해 있지 않습니다."
            ))
        }

        val familyGroupId = user.familyGroupId!!
        val memberCount = userRepository.findByFamilyGroupId(familyGroupId).size

        userService.updateFamilyGroup(userId, null)

        if (memberCount <= 1) {
            val familyGroup = familyGroupRepository.findById(familyGroupId).orElse(null)
            familyGroup?.let {
                it.status = FamilyGroupStatus.DISSOLVED
                familyGroupRepository.save(it)
            }

            val pendingCodes = inviteCodeRepository.findAll()
                .filter { it.familyGroupId == familyGroupId && it.status == InviteCodeStatus.PENDING }
            pendingCodes.forEach { code ->
                code.status = InviteCodeStatus.EXPIRED
                inviteCodeRepository.save(code)
            }
        }
    }

    @Transactional(readOnly = true)
    fun getShareSettings(userId: UUID): List<Map<String, Any?>> {
        val user = userRepository.findById(userId).orElse(null)
        if (user?.familyGroupId == null) {
            return emptyList()
        }

        val accounts = bankAccountRepository.findByUserId(userId)
        return accounts.map { account ->
            mapOf(
                "id" to account.id,
                "bankName" to account.bankName,
                "accountNumberMasked" to account.accountNumberMasked,
                "balance" to account.balance,
                "shareStatus" to account.shareStatus.name.lowercase(),
                "isHidden" to account.isHidden
            )
        }
    }

    @Transactional
    fun updateShareSettings(userId: UUID, request: UpdateShareSettingsRequest): List<Map<String, Any?>> {
        val user = userRepository.findById(userId).orElse(null)
        if (user?.familyGroupId == null) {
            throw BusinessException(ErrorCode.FAMILY_006, mapOf(
                "message" to "가족 그룹에 속해 있지 않습니다."
            ))
        }

        request.accounts.forEach { accountUpdate ->
            val account = bankAccountRepository.findByUserIdAndId(userId, accountUpdate.accountId)
            account?.let {
                if (accountUpdate.shareStatus != null) {
                    it.shareStatus = accountUpdate.shareStatus
                    bankAccountRepository.save(it)
                }
            }
        }

        return getShareSettings(userId)
    }

    data class FamilyInfo(
        val familyGroup: FamilyGroup?,
        val partner: Map<String, Any?>?,
        val inviteCode: String?
    )
}
