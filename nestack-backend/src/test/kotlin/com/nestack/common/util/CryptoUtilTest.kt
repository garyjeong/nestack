package com.nestack.common.util

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class CryptoUtilTest {

    @Test
    fun `비밀번호 해싱 및 검증`() {
        val password = "TestPassword123!"

        val hash = CryptoUtil.hashPassword(password)

        assertNotNull(hash)
        assertNotEquals(password, hash)
        assertTrue(CryptoUtil.verifyPassword(password, hash))
        assertFalse(CryptoUtil.verifyPassword("WrongPassword", hash))
    }

    @Test
    fun `AES 암호화 및 복호화`() {
        val plainText = "Sensitive Data"
        val keyHex = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

        val encrypted = CryptoUtil.encrypt(plainText, keyHex)

        assertNotNull(encrypted)
        assertNotEquals(plainText, encrypted)
        assertTrue(encrypted.contains(":"))

        val decrypted = CryptoUtil.decrypt(encrypted, keyHex)

        assertEquals(plainText, decrypted)
    }

    @Test
    fun `랜덤 토큰 생성`() {
        val token1 = CryptoUtil.generateRandomToken()
        val token2 = CryptoUtil.generateRandomToken()

        assertNotNull(token1)
        assertNotNull(token2)
        assertNotEquals(token1, token2)
        assertTrue(token1.length >= 32)
    }

    @Test
    fun `랜덤 문자열 생성`() {
        val charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        val length = 12

        val randomString = CryptoUtil.generateRandomString(length, charset)

        assertNotNull(randomString)
        assertEquals(length, randomString.length)
        assertTrue(randomString.all { it in charset })
    }
}
