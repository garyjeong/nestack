package com.nestack.infrastructure.persistence.entity

import com.nestack.common.enum.BadgeIssueType
import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "user_badges", indexes = [
    Index(name = "idx_user_badge", columnList = "user_id,badge_id")
])
@EntityListeners(AuditingEntityListener::class)
class UserBadge {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "UUID")
    var id: UUID = UUID.randomUUID()

    @Column(name = "user_id", columnDefinition = "UUID", nullable = false)
    var userId: UUID = UUID.randomUUID()

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    var user: User? = null

    @Column(name = "badge_id", columnDefinition = "UUID", nullable = false)
    var badgeId: UUID = UUID.randomUUID()

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "badge_id", insertable = false, updatable = false)
    var badge: Badge? = null

    @Enumerated(EnumType.STRING)
    @Column(name = "issue_type", nullable = false)
    var issueType: BadgeIssueType = BadgeIssueType.AUTO

    @CreatedDate
    @Column(name = "issued_at", nullable = false, updatable = false)
    var issuedAt: LocalDateTime = LocalDateTime.now()

    @Column(name = "issued_by", columnDefinition = "UUID", nullable = true)
    var issuedBy: UUID? = null // Admin user ID for manual issuance
}
