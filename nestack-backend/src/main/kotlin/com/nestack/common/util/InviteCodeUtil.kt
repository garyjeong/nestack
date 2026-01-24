package com.nestack.common.util

import com.nestack.common.constant.Defaults

object InviteCodeUtil {
    // Exclude similar-looking characters: 0/O, 1/I/L
    private const val INVITE_CODE_CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

    /**
     * Generate a 12-character invite code
     * Uses a character set that excludes confusing characters (0/O, 1/I/L)
     * @returns 12-character invite code (e.g., "A3B4C5D6E7F8")
     */
    fun generate(): String {
        return CryptoUtil.generateRandomString(Defaults.INVITE_CODE_LENGTH, INVITE_CODE_CHARSET)
    }

    /**
     * Validate invite code format
     * @param code Invite code to validate
     * @returns true if valid format
     */
    fun isValidFormat(code: String): Boolean {
        if (code.isBlank() || code.length != Defaults.INVITE_CODE_LENGTH) {
            return false
        }
        
        return code.all { it in INVITE_CODE_CHARSET }
    }

    /**
     * Normalize invite code (uppercase, trim)
     * @param code Invite code to normalize
     * @returns Normalized invite code
     */
    fun normalize(code: String): String {
        return code.trim().uppercase()
    }

    /**
     * Format invite code for display (add dashes for readability)
     * @param code 12-character invite code
     * @returns Formatted code (e.g., "A3B4-C5D6-E7F8")
     */
    fun formatForDisplay(code: String): String {
        if (code.length != Defaults.INVITE_CODE_LENGTH) {
            return code
        }
        return "${code.slice(0..3)}-${code.slice(4..7)}-${code.slice(8..11)}"
    }

    /**
     * Parse formatted invite code (remove dashes)
     * @param formattedCode Formatted invite code (may contain dashes)
     * @returns Raw 12-character invite code
     */
    fun parseFormattedCode(formattedCode: String): String {
        return formattedCode.replace("-", "").uppercase()
    }
}
