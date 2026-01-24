package com.nestack.common.util

import com.nestack.common.constant.Defaults
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class InviteCodeUtilTest {

    @Test
    fun `초대 코드 생성`() {
        val code = InviteCodeUtil.generate()

        assertNotNull(code)
        assertEquals(Defaults.INVITE_CODE_LENGTH, code.length)
        assertTrue(code.all { it in "ABCDEFGHJKMNPQRSTUVWXYZ23456789" })
    }

    @Test
    fun `초대 코드 형식 검증`() {
        val validCode = "A3B4C5D6E7F8"
        val invalidCode1 = "A3B4C5D6E7F" // Too short
        val invalidCode2 = "A3B4C5D6E7F89" // Too long
        val invalidCode3 = "A3B4C5D6E7F0" // Contains 0

        assertTrue(InviteCodeUtil.isValidFormat(validCode))
        assertFalse(InviteCodeUtil.isValidFormat(invalidCode1))
        assertFalse(InviteCodeUtil.isValidFormat(invalidCode2))
        assertFalse(InviteCodeUtil.isValidFormat(invalidCode3))
    }

    @Test
    fun `초대 코드 정규화`() {
        val code = "a3b4c5d6e7f8"
        val normalized = InviteCodeUtil.normalize(code)

        assertEquals("A3B4C5D6E7F8", normalized)
    }

    @Test
    fun `초대 코드 포맷팅`() {
        val code = "A3B4C5D6E7F8"
        val formatted = InviteCodeUtil.formatForDisplay(code)

        assertEquals("A3B4-C5D6-E7F8", formatted)
    }
}
