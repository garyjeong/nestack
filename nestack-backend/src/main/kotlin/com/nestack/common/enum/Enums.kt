package com.nestack.common.enum

enum class AuthProvider {
    LOCAL,
    GOOGLE
}

enum class UserStatus {
    ACTIVE,
    INACTIVE,
    WITHDRAWN
}

enum class FamilyGroupStatus {
    ACTIVE,
    DISSOLVED
}

enum class InviteCodeStatus {
    PENDING,
    USED,
    EXPIRED,
    REVOKED
}

enum class ShareStatus {
    FULL,
    BALANCE_ONLY,
    PRIVATE
}

enum class CategoryStatus {
    ACTIVE,
    INACTIVE
}

enum class MissionStatus {
    PENDING,
    IN_PROGRESS,
    COMPLETED,
    FAILED
}

enum class MissionType {
    TEMPLATE,
    CUSTOM
}

enum class MissionLevel {
    MAIN,
    MONTHLY,
    WEEKLY,
    DAILY
}

enum class GoalType {
    AMOUNT,
    AMOUNT_COUNT
}

enum class TransactionType {
    DEPOSIT,
    WITHDRAWAL
}

enum class BadgeType {
    LIFECYCLE,
    STREAK,
    FAMILY
}

enum class BadgeIssueType {
    AUTO,
    MANUAL
}

enum class AdminRole {
    SUPER_ADMIN,
    ADMIN
}

enum class AdminStatus {
    ACTIVE,
    INACTIVE
}

enum class DisplayType {
    POPUP,
    BANNER
}

enum class AnnouncementStatus {
    ACTIVE,
    INACTIVE
}

enum class TokenType {
    EMAIL_VERIFY,
    PASSWORD_RESET
}
