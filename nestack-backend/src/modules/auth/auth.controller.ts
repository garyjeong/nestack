import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  SignupDto,
  LoginDto,
  GoogleAuthDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import { Public, CurrentUser } from '../../common/decorators';
import { User } from '../users/entities/user.entity';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Public()
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공, 인증 메일 발송' })
  @ApiResponse({ status: 400, description: '이미 사용 중인 이메일' })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Get('verify-email')
  @Public()
  @ApiOperation({ summary: '이메일 인증 확인' })
  @ApiResponse({ status: 200, description: '이메일 인증 완료' })
  @ApiResponse({ status: 400, description: '유효하지 않은 토큰' })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이메일 인증 재발송' })
  @ApiResponse({ status: 200, description: '인증 메일 재발송' })
  async resendVerification(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(
    @Body() loginDto: LoginDto,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.login(loginDto, userAgent);
  }

  @Post('google')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Google 로그인' })
  @ApiResponse({ status: 200, description: 'Google 로그인 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 Google 토큰' })
  async googleAuth(
    @Body() googleAuthDto: GoogleAuthDto,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.googleAuth(googleAuthDto, userAgent);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiResponse({ status: 200, description: '토큰 갱신 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 리프레시 토큰' })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken, userAgent);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 완료' })
  async logout(
    @CurrentUser() user: User,
    @Body('refreshToken') refreshToken: string,
    @Body('allDevices') allDevices: boolean = false,
  ) {
    await this.authService.logout(user.id, refreshToken, allDevices);
    return { message: '로그아웃되었습니다.' };
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '비밀번호 찾기 (재설정 메일 발송)' })
  @ApiResponse({ status: 200, description: '비밀번호 재설정 메일 발송' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '비밀번호 재설정' })
  @ApiResponse({ status: 200, description: '비밀번호 재설정 완료' })
  @ApiResponse({ status: 400, description: '유효하지 않은 토큰' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
