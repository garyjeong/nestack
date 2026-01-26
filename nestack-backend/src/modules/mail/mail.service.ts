import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly appUrl: string;
  private readonly appName = 'Nestack';

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {
    this.appUrl = this.configService.get('app.url') || 'http://localhost:5173';
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    const verificationUrl = `${this.appUrl}/verify-email?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `[${this.appName}] 이메일 인증을 완료해주세요`,
        html: this.getVerificationEmailTemplate(name, verificationUrl),
      });
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      // Don't throw - email failure should not block the main flow
    }
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    const resetUrl = `${this.appUrl}/reset-password?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `[${this.appName}] 비밀번호 재설정 안내`,
        html: this.getPasswordResetEmailTemplate(name, resetUrl),
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
      // Don't throw - email failure should not block the main flow
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `[${this.appName}] 가입을 환영합니다!`,
        html: this.getWelcomeEmailTemplate(name),
      });
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}`, error);
    }
  }

  private getVerificationEmailTemplate(name: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <h1 style="color: #10b981; margin: 0 0 24px; font-size: 24px;">이메일 인증</h1>
            <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
              안녕하세요, ${name}님!
            </p>
            <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 32px;">
              ${this.appName}에 가입해 주셔서 감사합니다.<br>
              아래 버튼을 클릭하여 이메일 인증을 완료해주세요.
            </p>
            <a href="${verificationUrl}"
               style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
              이메일 인증하기
            </a>
            <p style="color: #94a3b8; font-size: 14px; margin: 32px 0 0;">
              이 링크는 24시간 동안 유효합니다.<br>
              본인이 가입하지 않으셨다면 이 이메일을 무시해주세요.
            </p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 24px 0 0;">
            © ${new Date().getFullYear()} ${this.appName}. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(name: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <h1 style="color: #10b981; margin: 0 0 24px; font-size: 24px;">비밀번호 재설정</h1>
            <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
              안녕하세요, ${name}님!
            </p>
            <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 32px;">
              비밀번호 재설정 요청이 접수되었습니다.<br>
              아래 버튼을 클릭하여 새 비밀번호를 설정해주세요.
            </p>
            <a href="${resetUrl}"
               style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
              비밀번호 재설정하기
            </a>
            <p style="color: #94a3b8; font-size: 14px; margin: 32px 0 0;">
              이 링크는 1시간 동안 유효합니다.<br>
              본인이 요청하지 않으셨다면 이 이메일을 무시해주세요.
            </p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 24px 0 0;">
            © ${new Date().getFullYear()} ${this.appName}. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <h1 style="color: #10b981; margin: 0 0 24px; font-size: 24px;">환영합니다! 🎉</h1>
            <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
              안녕하세요, ${name}님!
            </p>
            <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 32px;">
              ${this.appName}에 가입해 주셔서 감사합니다.<br><br>
              이제 가족과 함께 재무 목표를 설정하고,<br>
              미션을 통해 함께 성장해 나가세요!
            </p>
            <a href="${this.appUrl}"
               style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
              시작하기
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 24px 0 0;">
            © ${new Date().getFullYear()} ${this.appName}. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;
  }
}
