package com.nestack.domain.family

import com.nestack.common.constant.Defaults
import com.nestack.common.enum.AuthProvider
import com.nestack.common.enum.InviteCodeStatus
import com.nestack.domain.family.dto.JoinFamilyRequest
import com.nestack.domain.family.service.FamilyService
import com.nestack.domain.user.service.UserService
import com.nestack.infrastructure.persistence.repository.FamilyGroupRepository
import com.nestack.infrastructure.persistence.repository.InviteCodeRepository
import com.nestack.infrastructure.persistence.repository.UserRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional
import java.util.*

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class FamilyServiceTest {

    @Autowired
    private lateinit var familyService: FamilyService

    @Autowired
    private lateinit var userService: UserService

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var familyGroupRepository: FamilyGroupRepository

    @Autowired
    private lateinit var inviteCodeRepository: InviteCodeRepository

    @BeforeEach
    fun setUp() {
        inviteCodeRepository.deleteAll()
        familyGroupRepository.deleteAll()
        userRepository.deleteAll()
    }

    @Test
    fun `가족 그룹 생성 성공`() {
        val user = userService.create(
            email = "user1@example.com",
            password = "Test1234!@",
            name = "사용자1",
            provider = AuthProvider.LOCAL
        )

        val (familyGroup, inviteCode) = familyService.createFamilyGroup(user.id)

        assertNotNull(familyGroup.id)
        assertNotNull(inviteCode)
        assertEquals(user.id, familyGroup.createdBy)

        val updatedUser = userService.findById(user.id)
        assertEquals(familyGroup.id, updatedUser?.familyGroupId)
    }

    @Test
    fun `초대 코드로 가족 그룹 가입 성공`() {
        val user1 = userService.create(
            email = "user1@example.com",
            password = "Test1234!@",
            name = "사용자1",
            provider = AuthProvider.LOCAL
        )

        val (familyGroup, inviteCode) = familyService.createFamilyGroup(user1.id)

        val user2 = userService.create(
            email = "user2@example.com",
            password = "Test1234!@",
            name = "사용자2",
            provider = AuthProvider.LOCAL
        )

        val joinRequest = JoinFamilyRequest(inviteCode = inviteCode)
        val joinedFamilyGroup = familyService.joinFamily(user2.id, joinRequest)

        assertEquals(familyGroup.id, joinedFamilyGroup.id)
        assertEquals(2, joinedFamilyGroup.members.size)

        val updatedUser2 = userService.findById(user2.id)
        assertEquals(familyGroup.id, updatedUser2?.familyGroupId)

        val usedCode = inviteCodeRepository.findByCode(inviteCode)
        assertEquals(InviteCodeStatus.USED, usedCode?.status)
        assertEquals(user2.id, usedCode?.usedBy)
    }

    @Test
    fun `초대 코드로 가족 그룹 가입 실패 - 이미 가족 그룹에 속함`() {
        val user1 = userService.create(
            email = "user1@example.com",
            password = "Test1234!@",
            name = "사용자1",
            provider = AuthProvider.LOCAL
        )

        val (_, inviteCode) = familyService.createFamilyGroup(user1.id)

        val joinRequest = JoinFamilyRequest(inviteCode = inviteCode)
        
        assertThrows(com.nestack.common.exception.BusinessException::class.java) {
            familyService.joinFamily(user1.id, joinRequest)
        }
    }

    @Test
    fun `초대 코드 재발급`() {
        val user = userService.create(
            email = "user1@example.com",
            password = "Test1234!@",
            name = "사용자1",
            provider = AuthProvider.LOCAL
        )

        val (familyGroup, originalCode) = familyService.createFamilyGroup(user.id)

        val newInviteCode = familyService.regenerateInviteCode(user.id)

        assertNotEquals(originalCode, newInviteCode.code)
        assertEquals(familyGroup.id, newInviteCode.familyGroupId)
    }
}
