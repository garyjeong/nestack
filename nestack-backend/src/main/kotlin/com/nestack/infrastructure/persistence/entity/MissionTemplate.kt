package com.nestack.infrastructure.persistence.entity

import com.nestack.common.enum.CategoryStatus
import com.nestack.common.enum.GoalType
import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "mission_templates", indexes = [
    Index(name = "idx_mission_template_category", columnList = "category_id")
])
@EntityListeners(AuditingEntityListener::class)
class MissionTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "UUID")
    var id: UUID = UUID.randomUUID()

    @Column(name = "name", length = 100, nullable = false)
    var name: String = ""

    @Column(name = "description", columnDefinition = "TEXT", nullable = true)
    var description: String? = null

    @Column(name = "category_id", columnDefinition = "UUID", nullable = false)
    var categoryId: UUID = UUID.randomUUID()

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    var category: LifeCycleCategory? = null

    @Enumerated(EnumType.STRING)
    @Column(name = "goal_type", nullable = false)
    var goalType: GoalType = GoalType.AMOUNT

    @Column(name = "default_goal_amount", precision = 18, scale = 2, nullable = true)
    var defaultGoalAmount: BigDecimal? = null

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: CategoryStatus = CategoryStatus.ACTIVE

    @Column(name = "usage_count", nullable = false)
    var usageCount: Int = 0

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
}
