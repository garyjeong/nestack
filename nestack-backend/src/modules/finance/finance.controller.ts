import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Res,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { UpdateAccountDto, TransactionQueryDto } from './dto';
import { CurrentUser, Public } from '../../common/decorators';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@ApiTags('finance')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'finance', version: '1' })
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService,
    private readonly configService: ConfigService,
  ) {}

  @Get('openbanking/authorize')
  @ApiOperation({ summary: '오픈뱅킹 인증 시작' })
  @ApiResponse({ status: 302, description: '오픈뱅킹 인증 페이지로 리다이렉트' })
  async authorize(@CurrentUser() user: User, @Res() res: Response) {
    // Generate state with user ID for callback
    const state = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64');
    const authUrl = this.financeService.getAuthorizationUrl(state);
    return res.redirect(authUrl);
  }

  @Get('openbanking/callback')
  @Public()
  @ApiOperation({ summary: '오픈뱅킹 콜백 처리' })
  @ApiResponse({ status: 302, description: '앱으로 리다이렉트' })
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      // Decode state to get user ID
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
      const userId = stateData.userId;

      await this.financeService.handleCallback(userId, code);

      // Redirect to app success page
      const frontendUrl = this.configService.get<string>('app.frontendUrl') || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/finance/connected`);
    } catch (error) {
      // Redirect to app error page
      const frontendUrl = this.configService.get<string>('app.frontendUrl') || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/finance/error`);
    }
  }

  @Get('openbanking/status')
  @ApiOperation({ summary: '오픈뱅킹 연동 상태 확인' })
  @ApiResponse({ status: 200, description: '연동 상태 반환' })
  async getConnectionStatus(@CurrentUser() user: User) {
    const isConnected = await this.financeService.isConnected(user.id);
    return { isConnected };
  }

  @Delete('openbanking')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '오픈뱅킹 연동 해제' })
  @ApiResponse({ status: 200, description: '연동 해제 성공' })
  async disconnect(@CurrentUser() user: User) {
    await this.financeService.disconnect(user.id);
    return { message: '오픈뱅킹 연동이 해제되었습니다.' };
  }

  @Get('accounts')
  @ApiOperation({ summary: '연동 계좌 목록 조회' })
  @ApiResponse({ status: 200, description: '계좌 목록 반환' })
  async getAccounts(@CurrentUser() user: User) {
    const accounts = await this.financeService.getAccounts(user.id);
    return { accounts };
  }

  @Post('accounts/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '모든 계좌 동기화' })
  @ApiResponse({ status: 200, description: '동기화 성공' })
  async syncAllAccounts(@CurrentUser() user: User) {
    const accounts = await this.financeService.syncAccounts(user.id);
    return { accounts, message: '계좌가 동기화되었습니다.' };
  }

  @Get('accounts/:id')
  @ApiOperation({ summary: '계좌 상세 조회' })
  @ApiParam({ name: 'id', description: '계좌 ID' })
  @ApiResponse({ status: 200, description: '계좌 정보 반환' })
  @ApiResponse({ status: 404, description: '계좌를 찾을 수 없음' })
  async getAccount(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const account = await this.financeService.getAccountById(user.id, id);
    return { account };
  }

  @Patch('accounts/:id')
  @ApiOperation({ summary: '계좌 설정 수정' })
  @ApiParam({ name: 'id', description: '계좌 ID' })
  @ApiResponse({ status: 200, description: '계좌 수정 성공' })
  @ApiResponse({ status: 404, description: '계좌를 찾을 수 없음' })
  async updateAccount(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAccountDto,
  ) {
    const account = await this.financeService.updateAccount(user.id, id, updateDto);
    return { account, message: '계좌 설정이 수정되었습니다.' };
  }

  @Post('accounts/:id/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '단일 계좌 거래내역 동기화' })
  @ApiParam({ name: 'id', description: '계좌 ID' })
  @ApiResponse({ status: 200, description: '동기화 성공' })
  async syncAccountTransactions(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const transactions = await this.financeService.syncAccountTransactions(user.id, id);
    return { transactions, message: '거래내역이 동기화되었습니다.' };
  }

  @Get('accounts/:id/transactions')
  @ApiOperation({ summary: '계좌 거래내역 조회' })
  @ApiParam({ name: 'id', description: '계좌 ID' })
  @ApiResponse({ status: 200, description: '거래내역 반환' })
  @ApiResponse({ status: 404, description: '계좌를 찾을 수 없음' })
  async getTransactions(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: TransactionQueryDto,
  ) {
    const transactions = await this.financeService.getTransactions(user.id, id, query);
    return { transactions };
  }
}
