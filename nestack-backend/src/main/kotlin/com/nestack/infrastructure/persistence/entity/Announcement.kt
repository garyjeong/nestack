package com.nestack.infrastructure.persistence.entity

import com.nestack.common.enum.AnnouncementStatus
import com.nestack.common.enum.DisplayType
import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "announcements")
@EntityListeners(AuditingEntityListener::class)
class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "UUID")
    var id: UUID = UUID.randomUUID()

    @Column(name = "title", length = 200, nullable = false)
    var title: String = ""

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    var content: String = ""

    @Enumerated(EnumType.STRING)
    @Column(name = "display_type", nullable = false)
    var displayType: DisplayType = DisplayType.BANNER

    @Column(name = "start_date", nullable = false)
    var startDate: LocalDateTime = LocalDateTime.now()

    @Column(name = "end_date", nullable = false)
    var endDate: LocalDateTime = LocalDateTime.now()

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: AnnouncementStatus = AnnouncementStatus.ACTIVE

    @Column(name = "created_by", columnDefinition = "UUID", nullable = false)
    var createdBy: UUID = UUID.randomUUID()

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", insertable = false, updatable = false)
    var creator: AdminUser? = null

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
}
