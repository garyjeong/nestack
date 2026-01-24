package com.nestack.common.interceptor

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor

@Component
class LoggingInterceptor : HandlerInterceptor {

    private val logger = LoggerFactory.getLogger(LoggingInterceptor::class.java)

    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any
    ): Boolean {
        request.setAttribute("startTime", System.currentTimeMillis())
        return true
    }

    override fun afterCompletion(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
        ex: Exception?
    ) {
        val startTime = request.getAttribute("startTime") as? Long ?: return
        val duration = System.currentTimeMillis() - startTime
        
        val method = request.method
        val uri = request.requestURI
        val status = response.status
        val userAgent = request.getHeader("User-Agent") ?: "-"
        val ip = request.remoteAddr

        if (ex != null) {
            logger.error(
                "$method $uri $status - ${duration}ms - $userAgent $ip",
                ex
            )
        } else {
            logger.info(
                "$method $uri $status - ${duration}ms - $userAgent $ip"
            )
        }
    }
}
