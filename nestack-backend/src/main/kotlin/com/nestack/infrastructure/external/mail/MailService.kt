package com.nestack.infrastructure.external.mail

import org.springframework.beans.factory.annotation.Value
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Service

@Service
class MailService(
    private val mailSender: JavaMailSender
) {
    @Value("\${spring.mail.username}")
    private lateinit var fromEmail: String

    @Value("\${spring.frontend-url:http://localhost:5173}")
    private var frontendUrl: String = "http://localhost:5173"

    fun sendVerificationEmail(email: String, name: String, token: String) {
        val verificationUrl = "$frontendUrl/auth/verify-email?token=$token"
        
        val message = SimpleMailMessage().apply {
            setTo(email)
            setSubject("[Nestack] 이메일 인증을 완료해주세요")
            setText("""
                안녕하세요, ${name}님!
                
                Nestack에 가입해주셔서 감사합니다.
                아래 링크를 클릭하여 이메일 인증을 완료해주세요.
                
                $verificationUrl
                
                이 링크는 24시간 동안 유효합니다.
                
                감사합니다.
                Nestack 팀
            """.trimIndent())
        }
        
        mailSender.send(message)
    }

    fun sendWelcomeEmail(email: String, name: String) {
        val message = SimpleMailMessage().apply {
            setTo(email)
            setSubject("[Nestack] 환영합니다!")
            setText("""
                안녕하세요, ${name}님!
                
                Nestack에 오신 것을 환영합니다!
                이제 부부/커플과 함께 자산을 관리하고 미션을 달성해보세요.
                
                감사합니다.
                Nestack 팀
            """.trimIndent())
        }
        
        mailSender.send(message)
    }

    fun sendPasswordResetEmail(email: String, name: String, token: String) {
        val resetUrl = "$frontendUrl/auth/reset-password?token=$token"
        
        val message = SimpleMailMessage().apply {
            setTo(email)
            setSubject("[Nestack] 비밀번호 재설정")
            setText("""
                안녕하세요, ${name}님!
                
                비밀번호 재설정을 요청하셨습니다.
                아래 링크를 클릭하여 새 비밀번호를 설정해주세요.
                
                $resetUrl
                
                이 링크는 1시간 동안 유효합니다.
                만약 비밀번호 재설정을 요청하지 않으셨다면, 이 메일을 무시해주세요.
                
                감사합니다.
                Nestack 팀
            """.trimIndent())
        }
        
        mailSender.send(message)
    }
}
