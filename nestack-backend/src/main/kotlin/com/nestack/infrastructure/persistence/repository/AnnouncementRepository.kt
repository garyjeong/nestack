package com.nestack.infrastructure.persistence.repository

import com.nestack.common.enum.AnnouncementStatus
import com.nestack.infrastructure.persistence.entity.Announcement
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.*

@Repository
interface AnnouncementRepository : JpaRepository<Announcement, UUID> {
    @Query("SELECT a FROM Announcement a WHERE a.status = :status AND a.startDate <= :now AND a.endDate >= :now ORDER BY a.createdAt DESC")
    fun findActiveAnnouncements(
        @Param("status") status: AnnouncementStatus,
        @Param("now") now: LocalDateTime
    ): List<Announcement>
}
