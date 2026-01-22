import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;
  private readonly fromAddress: string;
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.fromAddress = this.configService.get<string>('mail.from') || 'noreply@nestack.com';
    this.frontendUrl = this.configService.get<string>('frontendUrl') || 'http://localhost:5173';

    // Create transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('mail.user'),
        pass: this.configService.get<string>('mail.password'),
      },
    });
  }

  /**
   * Send email
   */
  async sendMail(options: SendMailOptions): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: `"Nestack" <${this.fromAddress}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      this.logger.log(`Email sent to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      // In development, don't throw error for email failures
      if (this.configService.get<string>('nodeEnv') === 'development') {
        this.logger.warn('Email sending failed in development mode, continuing...');
        return false;
      }
      throw error;
    }
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(email: string, name: string, token: string): Promise<boolean> {
    const verificationUrl = `${this.frontendUrl}/auth/verify-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; }
          .logo { font-size: 24px; font-weight: bold; color: #10B981; }
          .content { background: #f9fafb; padding: 30px; border-radius: 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #10B981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px 0; color: #6b7280; font-size: 12px; }
          .link { color: #10B981; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Nestack</div>
          </div>
          <div class="content">
            <h2>이메일 인증</h2>
            <p>안녕하세요, ${name}님!</p>
            <p>Nestack에 가입해 주셔서 감사합니다. 아래 버튼을 클릭하여 이메일 인증을 완료해주세요.</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">이메일 인증하기</a>
            </p>
            <p>버튼이 작동하지 않는 경우, 아래 링크를 복사하여 브라우저에 붙여넣기 해주세요:</p>
            <p class="link">${verificationUrl}</p>
            <p style="color: #6b7280; font-size: 14px;">이 링크는 24시간 동안 유효합니다.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Nestack. All rights reserved.</p>
            <p>본 메일은 발신 전용입니다.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
안녕하세요, ${name}님!

Nestack에 가입해 주셔서 감사합니다. 아래 링크를 클릭하여 이메일 인증을 완료해주세요.

${verificationUrl}

이 링크는 24시간 동안 유효합니다.

© ${new Date().getFullYear()} Nestack. All rights reserved.
    `;

    return this.sendMail({
      to: email,
      subject: '[Nestack] 이메일 인증을 완료해주세요',
      html,
      text,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<boolean> {
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; }
          .logo { font-size: 24px; font-weight: bold; color: #10B981; }
          .content { background: #f9fafb; padding: 30px; border-radius: 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #F43F5E; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px 0; color: #6b7280; font-size: 12px; }
          .link { color: #10B981; word-break: break-all; }
          .warning { background: #fef3c7; padding: 12px; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Nestack</div>
          </div>
          <div class="content">
            <h2>비밀번호 재설정</h2>
            <p>안녕하세요, ${name}님!</p>
            <p>비밀번호 재설정을 요청하셨습니다. 아래 버튼을 클릭하여 새 비밀번호를 설정해주세요.</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">비밀번호 재설정</a>
            </p>
            <p>버튼이 작동하지 않는 경우, 아래 링크를 복사하여 브라우저에 붙여넣기 해주세요:</p>
            <p class="link">${resetUrl}</p>
            <p style="color: #6b7280; font-size: 14px;">이 링크는 1시간 동안 유효합니다.</p>
            <div class="warning">
              <p style="margin: 0; font-size: 14px;">⚠️ 본인이 요청하지 않은 경우, 이 이메일을 무시하셔도 됩니다.</p>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Nestack. All rights reserved.</p>
            <p>본 메일은 발신 전용입니다.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
안녕하세요, ${name}님!

비밀번호 재설정을 요청하셨습니다. 아래 링크를 클릭하여 새 비밀번호를 설정해주세요.

${resetUrl}

이 링크는 1시간 동안 유효합니다.

⚠️ 본인이 요청하지 않은 경우, 이 이메일을 무시하셔도 됩니다.

© ${new Date().getFullYear()} Nestack. All rights reserved.
    `;

    return this.sendMail({
      to: email,
      subject: '[Nestack] 비밀번호 재설정',
      html,
      text,
    });
  }

  /**
   * Send welcome email after verification
   */
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; }
          .logo { font-size: 24px; font-weight: bold; color: #10B981; }
          .content { background: #f9fafb; padding: 30px; border-radius: 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #10B981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px 0; color: #6b7280; font-size: 12px; }
          .feature { padding: 10px 0; }
          .feature-icon { font-size: 24px; margin-right: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Nestack</div>
          </div>
          <div class="content">
            <h2>환영합니다! 🎉</h2>
            <p>안녕하세요, ${name}님!</p>
            <p>Nestack 가족이 되어주셔서 진심으로 감사드립니다.</p>
            <p>이제 배우자와 함께 재정 목표를 설정하고, 미션을 완료하며 성장해 나가실 수 있습니다.</p>

            <h3>시작하기</h3>
            <div class="feature">
              <span class="feature-icon">👫</span>
              <strong>가족 연결</strong> - 배우자를 초대하여 함께 시작하세요
            </div>
            <div class="feature">
              <span class="feature-icon">🎯</span>
              <strong>미션 설정</strong> - 결혼 준비, 주택 마련 등 목표를 설정하세요
            </div>
            <div class="feature">
              <span class="feature-icon">💰</span>
              <strong>자산 연동</strong> - 은행 계좌를 연동하여 진행 상황을 확인하세요
            </div>

            <p style="text-align: center;">
              <a href="${this.frontendUrl}" class="button">시작하기</a>
            </p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Nestack. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendMail({
      to: email,
      subject: '[Nestack] 환영합니다! 함께 성장해요 🎉',
      html,
    });
  }
}
