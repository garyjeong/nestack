package com.nestack.infrastructure.persistence.entity

import com.nestack.common.enum.CategoryStatus
import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "lifecycle_categories")
@EntityListeners(AuditingEntityListener::class)
class LifeCycleCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "UUID")
    var id: UUID = UUID.randomUUID()

    @Column(name = "name", length = 50, nullable = false)
    var name: String = ""

    @Column(name = "display_order", nullable = false)
    var displayOrder: Int = 0

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: CategoryStatus = CategoryStatus.ACTIVE

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    var templates: MutableList<MissionTemplate> = mutableListOf()

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    var missions: MutableList<Mission> = mutableListOf()
}
