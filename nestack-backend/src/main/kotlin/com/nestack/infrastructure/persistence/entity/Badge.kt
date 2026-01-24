package com.nestack.infrastructure.persistence.entity

import com.nestack.common.enum.BadgeType
import com.nestack.common.enum.CategoryStatus
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "badges")
@EntityListeners(AuditingEntityListener::class)
class Badge {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "UUID")
    var id: UUID = UUID.randomUUID()

    @Column(name = "name", length = 100, nullable = false)
    var name: String = ""

    @Column(name = "description", columnDefinition = "TEXT", nullable = true)
    var description: String? = null

    @Column(name = "image_url", length = 500, nullable = true)
    var imageUrl: String? = null

    @Enumerated(EnumType.STRING)
    @Column(name = "badge_type", nullable = false)
    var badgeType: BadgeType = BadgeType.LIFECYCLE

    @Column(name = "condition_type", length = 50, nullable = false)
    var conditionType: String = ""

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "condition_value", columnDefinition = "JSONB", nullable = false)
    var conditionValue: Map<String, Any> = emptyMap()

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: CategoryStatus = CategoryStatus.ACTIVE

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()

    @OneToMany(mappedBy = "badge", fetch = FetchType.LAZY)
    var userBadges: MutableList<UserBadge> = mutableListOf()
}
