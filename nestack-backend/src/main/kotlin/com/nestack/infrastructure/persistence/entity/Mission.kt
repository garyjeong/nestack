package com.nestack.infrastructure.persistence.entity

import com.nestack.common.enum.MissionLevel
import com.nestack.common.enum.MissionStatus
import com.nestack.common.enum.MissionType
import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "missions", indexes = [
    Index(name = "idx_mission_user", columnList = "user_id"),
    Index(name = "idx_mission_family_group", columnList = "family_group_id"),
    Index(name = "idx_mission_parent", columnList = "parent_mission_id"),
    Index(name = "idx_mission_status", columnList = "status")
])
@EntityListeners(AuditingEntityListener::class)
class Mission {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "UUID")
    var id: UUID = UUID.randomUUID()

    @Column(name = "user_id", columnDefinition = "UUID", nullable = false)
    var userId: UUID = UUID.randomUUID()

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    var user: User? = null

    @Column(name = "family_group_id", columnDefinition = "UUID", nullable = true)
    var familyGroupId: UUID? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "family_group_id", insertable = false, updatable = false)
    var familyGroup: FamilyGroup? = null

    @Column(name = "template_id", columnDefinition = "UUID", nullable = true)
    var templateId: UUID? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", insertable = false, updatable = false)
    var template: MissionTemplate? = null

    @Column(name = "category_id", columnDefinition = "UUID", nullable = false)
    var categoryId: UUID = UUID.randomUUID()

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    var category: LifeCycleCategory? = null

    @Column(name = "parent_mission_id", columnDefinition = "UUID", nullable = true)
    var parentMissionId: UUID? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_mission_id", insertable = false, updatable = false)
    var parentMission: Mission? = null

    @OneToMany(mappedBy = "parentMission", fetch = FetchType.LAZY)
    var subMissions: MutableList<Mission> = mutableListOf()

    @Column(name = "name", length = 100, nullable = false)
    var name: String = ""

    @Column(name = "description", columnDefinition = "TEXT", nullable = true)
    var description: String? = null

    @Column(name = "goal_amount", precision = 18, scale = 2, nullable = false)
    var goalAmount: BigDecimal = BigDecimal.ZERO

    @Column(name = "current_amount", precision = 18, scale = 2, nullable = false)
    var currentAmount: BigDecimal = BigDecimal.ZERO

    @Enumerated(EnumType.STRING)
    @Column(name = "mission_type", nullable = false)
    var missionType: MissionType = MissionType.CUSTOM

    @Enumerated(EnumType.STRING)
    @Column(name = "mission_level", nullable = false)
    var missionLevel: MissionLevel = MissionLevel.MAIN

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: MissionStatus = MissionStatus.PENDING

    @Column(name = "start_date", nullable = true)
    var startDate: LocalDate? = null

    @Column(name = "due_date", nullable = false)
    var dueDate: LocalDate = LocalDate.now()

    @Column(name = "completed_at", nullable = true)
    var completedAt: LocalDateTime? = null

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()

    @OneToMany(mappedBy = "mission", fetch = FetchType.LAZY)
    var transactions: MutableList<Transaction> = mutableListOf()

    @OneToMany(mappedBy = "mission", fetch = FetchType.LAZY)
    var sharedAccounts: MutableList<MissionSharedAccount> = mutableListOf()

    val progressPercent: Int
        get() {
            if (goalAmount.compareTo(BigDecimal.ZERO) == 0) return 0
            val percent = (currentAmount.divide(goalAmount, 4, java.math.RoundingMode.HALF_UP) * BigDecimal(100)).toInt()
            return minOf(100, percent)
        }
}
