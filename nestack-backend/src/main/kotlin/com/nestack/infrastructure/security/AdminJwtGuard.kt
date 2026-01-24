package com.nestack.infrastructure.security

import com.nestack.infrastructure.security.JwtTokenProvider
import jakarta.servlet.http.HttpServletRequest
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class AdminJwtGuard(
    private val jwtTokenProvider: JwtTokenProvider
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: jakarta.servlet.http.HttpServletResponse,
        filterChain: jakarta.servlet.FilterChain
    ) {
        val token = getTokenFromRequest(request)

        if (token != null && jwtTokenProvider.validateAccessToken(token)) {
            try {
                val userId = jwtTokenProvider.getUserIdFromAccessToken(token)
                // In production, verify admin user and isAdmin flag from token
                val authentication = UsernamePasswordAuthenticationToken(
                    userId,
                    null,
                    listOf(SimpleGrantedAuthority("ROLE_ADMIN"))
                )
                SecurityContextHolder.getContext().authentication = authentication
                request.setAttribute("adminId", userId)
            } catch (e: Exception) {
                SecurityContextHolder.clearContext()
            }
        }

        filterChain.doFilter(request, response)
    }

    private fun getTokenFromRequest(request: HttpServletRequest): String? {
        val bearerToken = request.getHeader("Authorization")
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7)
        }
        return null
    }
}
