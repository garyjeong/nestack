package com.nestack.infrastructure.security

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.security.Key
import java.util.*

@Component
class JwtTokenProvider {

    @Value("\${spring.security.jwt.access-secret}")
    private lateinit var accessSecret: String

    @Value("\${spring.security.jwt.refresh-secret}")
    private lateinit var refreshSecret: String

    @Value("\${spring.security.jwt.access-expiration:3600}")
    private var accessExpiration: Long = 3600

    @Value("\${spring.security.jwt.refresh-expiration:604800}")
    private var refreshExpiration: Long = 604800

    private val accessSecretKey: Key
        get() = Keys.hmacShaKeyFor(accessSecret.toByteArray())

    private val refreshSecretKey: Key
        get() = Keys.hmacShaKeyFor(refreshSecret.toByteArray())

    /**
     * Generate access token
     */
    fun generateAccessToken(userId: String, email: String): String {
        val now = Date()
        val expiryDate = Date(now.time + accessExpiration * 1000)

        return Jwts.builder()
            .setSubject(userId)
            .claim("email", email)
            .claim("type", "access")
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(accessSecretKey)
            .compact()
    }

    /**
     * Generate refresh token
     */
    fun generateRefreshToken(userId: String): String {
        val now = Date()
        val expiryDate = Date(now.time + refreshExpiration * 1000)

        return Jwts.builder()
            .setSubject(userId)
            .claim("type", "refresh")
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(refreshSecretKey)
            .compact()
    }

    /**
     * Get user ID from access token
     */
    fun getUserIdFromAccessToken(token: String): String {
        val claims = getClaimsFromAccessToken(token)
        return claims.subject
    }

    /**
     * Get user ID from refresh token
     */
    fun getUserIdFromRefreshToken(token: String): String {
        val claims = getClaimsFromRefreshToken(token)
        return claims.subject
    }

    /**
     * Validate access token
     */
    fun validateAccessToken(token: String): Boolean {
        return try {
            val claims = getClaimsFromAccessToken(token)
            claims["type"] == "access"
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Validate refresh token
     */
    fun validateRefreshToken(token: String): Boolean {
        return try {
            val claims = getClaimsFromRefreshToken(token)
            claims["type"] == "refresh"
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Get claims from access token
     */
    private fun getClaimsFromAccessToken(token: String): Claims {
        return Jwts.parser()
            .verifyWith(accessSecretKey as javax.crypto.SecretKey)
            .build()
            .parseSignedClaims(token)
            .payload
    }

    /**
     * Get claims from refresh token
     */
    private fun getClaimsFromRefreshToken(token: String): Claims {
        return Jwts.parser()
            .verifyWith(refreshSecretKey as javax.crypto.SecretKey)
            .build()
            .parseSignedClaims(token)
            .payload
    }

    /**
     * Get access token expiration in seconds
     */
    fun getAccessTokenExpiration(): Long {
        return accessExpiration
    }
}
