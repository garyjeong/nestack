package com.nestack.infrastructure.persistence

import com.nestack.common.enum.AuthProvider
import com.nestack.common.enum.FamilyGroupStatus
import com.nestack.infrastructure.persistence.entity.FamilyGroup
import com.nestack.infrastructure.persistence.entity.User
import com.nestack.infrastructure.persistence.repository.FamilyGroupRepository
import com.nestack.infrastructure.persistence.repository.UserRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.test.context.ActiveProfiles

@DataJpaTest
@ActiveProfiles("test")
class FamilyGroupRepositoryTest {

    @Autowired
    private lateinit var entityManager: TestEntityManager

    @Autowired
    private lateinit var familyGroupRepository: FamilyGroupRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    @BeforeEach
    fun setUp() {
        familyGroupRepository.deleteAll()
        userRepository.deleteAll()
    }

    @Test
    fun `생성자로 가족 그룹 조회`() {
        val user = User().apply {
            email = "test@example.com"
            name = "테스트 사용자"
            provider = AuthProvider.LOCAL
        }
        entityManager.persistAndFlush(user)

        val familyGroup = FamilyGroup().apply {
            createdBy = user.id
            status = FamilyGroupStatus.ACTIVE
        }
        entityManager.persistAndFlush(familyGroup)

        val found = familyGroupRepository.findByCreatedBy(user.id)

        assertNotNull(found)
        assertEquals(user.id, found?.createdBy)
    }
}
