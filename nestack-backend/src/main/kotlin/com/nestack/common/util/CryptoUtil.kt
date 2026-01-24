package com.nestack.common.util

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec
import kotlin.math.absoluteValue

object CryptoUtil {
    private const val ALGORITHM = "AES/GCM/NoPadding"
    private const val IV_LENGTH = 16
    private const val TAG_LENGTH = 128
    private const val SALT_ROUNDS = 12

    private val passwordEncoder: PasswordEncoder = BCryptPasswordEncoder(SALT_ROUNDS)
    private val secureRandom = SecureRandom()

    /**
     * Hash password using BCrypt
     */
    fun hashPassword(password: String): String {
        return passwordEncoder.encode(password)
    }

    /**
     * Verify password against hash
     */
    fun verifyPassword(password: String, hash: String): Boolean {
        return passwordEncoder.matches(password, hash)
    }

    /**
     * Encrypt sensitive data using AES-256-GCM
     * @param text Plain text to encrypt
     * @param keyHex Encryption key in hex format (64 characters = 32 bytes)
     * @returns Encrypted string in format: iv:authTag:encrypted
     */
    fun encrypt(text: String, keyHex: String): String {
        val key = SecretKeySpec(hexStringToByteArray(keyHex), "AES")
        val iv = ByteArray(IV_LENGTH).apply { secureRandom.nextBytes(this) }
        
        val cipher = Cipher.getInstance(ALGORITHM)
        val parameterSpec = GCMParameterSpec(TAG_LENGTH, iv)
        cipher.init(Cipher.ENCRYPT_MODE, key, parameterSpec)
        
        val encrypted = cipher.doFinal(text.toByteArray(Charsets.UTF_8))
        // GCM mode: encrypted bytes contain ciphertext + authTag
        // Auth tag is automatically appended by GCM, we need to extract it
        val ciphertextLength = encrypted.size - 16 // Auth tag is 16 bytes
        val ciphertext = encrypted.sliceArray(0 until ciphertextLength)
        val authTag = encrypted.sliceArray(ciphertextLength until encrypted.size)
        
        return "${bytesToHexString(iv)}:${bytesToHexString(authTag)}:${bytesToHexString(ciphertext)}"
    }

    /**
     * Decrypt data encrypted with AES-256-GCM
     * @param encryptedData Encrypted string in format: iv:authTag:encrypted
     * @param keyHex Encryption key in hex format (64 characters = 32 bytes)
     * @returns Decrypted plain text
     */
    fun decrypt(encryptedData: String, keyHex: String): String {
        val parts = encryptedData.split(":")
        require(parts.size == 3) { "Invalid encrypted data format" }
        
        val iv = hexStringToByteArray(parts[0])
        val authTag = hexStringToByteArray(parts[1])
        val ciphertext = hexStringToByteArray(parts[2])
        
        val key = SecretKeySpec(hexStringToByteArray(keyHex), "AES")
        val cipher = Cipher.getInstance(ALGORITHM)
        val parameterSpec = GCMParameterSpec(TAG_LENGTH, iv)
        
        // Combine ciphertext and authTag for GCM decryption
        val encrypted = ciphertext + authTag
        cipher.init(Cipher.DECRYPT_MODE, key, parameterSpec)
        
        val decrypted = cipher.doFinal(encrypted)
        return String(decrypted, Charsets.UTF_8)
    }

    /**
     * Generate a random token (for email verification, password reset, etc.)
     * @param length Token length in bytes (default: 32)
     * @returns Random hex string
     */
    fun generateRandomToken(length: Int = 32): String {
        val bytes = ByteArray(length)
        secureRandom.nextBytes(bytes)
        return bytesToHexString(bytes)
    }

    /**
     * Generate a secure random string
     * @param length String length
     * @param charset Characters to use
     * @returns Random string
     */
    fun generateRandomString(
        length: Int,
        charset: String = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    ): String {
        val randomBytes = ByteArray(length)
        secureRandom.nextBytes(randomBytes)
        
        return buildString(length) {
            for (i in 0 until length) {
                append(charset[randomBytes[i].toInt().absoluteValue % charset.length])
            }
        }
    }

    private fun hexStringToByteArray(hex: String): ByteArray {
        val len = hex.length
        val data = ByteArray(len / 2)
        var i = 0
        while (i < len) {
            data[i / 2] = ((Character.digit(hex[i], 16) shl 4) + Character.digit(hex[i + 1], 16)).toByte()
            i += 2
        }
        return data
    }

    private fun bytesToHexString(bytes: ByteArray): String {
        return bytes.joinToString("") { "%02x".format(it) }
    }
}
