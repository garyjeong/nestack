import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Res,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { FinanceService } from './finance.service';
import {
  AccountResponseDto,
  UpdateAccountDto,
  TransactionResponseDto,
  TransactionFilterDto,
  OpenBankingStatusDto,
} from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../../database/entities';
import { PaginatedResponse } from '../../common/dto/api-response.dto';

@ApiTags('Finance')
@ApiBearerAuth()
@Controller('finance')
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService,
    private readonly configService: ConfigService,
  ) {}

  // Open Banking
  @Get('openbanking/authorize')
  @ApiOperation({ summary: 'Get Open Banking authorization URL' })
  @ApiResponse({ status: 200, description: 'Authorization URL returned' })
  getAuthorizeUrl(@CurrentUser() user: User): { url: string } {
    const url = this.financeService.getAuthorizeUrl(user.id);
    return { url };
  }

  @Public()
  @Get('openbanking/callback')
  @ApiOperation({ summary: 'Open Banking OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirect to frontend' })
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      await this.financeService.handleCallback(code, state);
      const frontendUrl = this.configService.get('app.frontendUrl');
      res.redirect(`${frontendUrl}/finance?connected=true`);
    } catch (error) {
      const frontendUrl = this.configService.get('app.frontendUrl');
      res.redirect(`${frontendUrl}/finance?error=connection_failed`);
    }
  }

  @Get('openbanking/status')
  @ApiOperation({ summary: 'Get Open Banking connection status' })
  @ApiResponse({ status: 200, description: 'Connection status returned' })
  async getOpenBankingStatus(
    @CurrentUser() user: User,
  ): Promise<OpenBankingStatusDto> {
    return this.financeService.getOpenBankingStatus(user.id);
  }

  @Delete('openbanking')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disconnect Open Banking' })
  @ApiResponse({ status: 200, description: 'Disconnected successfully' })
  async disconnectOpenBanking(
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    await this.financeService.disconnectOpenBanking(user.id);
    return { message: 'Open Banking disconnected successfully' };
  }

  // Accounts
  @Get('accounts')
  @ApiOperation({ summary: 'Get all bank accounts' })
  @ApiResponse({ status: 200, description: 'Accounts retrieved' })
  async getAccounts(@CurrentUser() user: User): Promise<AccountResponseDto[]> {
    return this.financeService.getAccounts(user.id);
  }

  @Post('accounts/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync bank accounts from Open Banking' })
  @ApiResponse({ status: 200, description: 'Accounts synced' })
  async syncAccounts(@CurrentUser() user: User): Promise<AccountResponseDto[]> {
    return this.financeService.syncAccounts(user.id);
  }

  @Patch('accounts/:id')
  @ApiOperation({ summary: 'Update bank account settings' })
  @ApiResponse({ status: 200, description: 'Account updated' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async updateAccount(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
  ): Promise<AccountResponseDto> {
    return this.financeService.updateAccount(user.id, id, dto);
  }

  @Post('accounts/:id/transactions/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync transactions for a bank account' })
  @ApiResponse({ status: 200, description: 'Transactions synced' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async syncTransactions(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.financeService.syncTransactions(user.id, id);
    return { message: 'Transactions synced successfully' };
  }

  // Transactions
  @Get('transactions')
  @ApiOperation({ summary: 'Get transactions with filters' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved' })
  async getTransactions(
    @CurrentUser() user: User,
    @Query() filters: TransactionFilterDto,
  ): Promise<PaginatedResponse<TransactionResponseDto>> {
    return this.financeService.getTransactions(user.id, filters);
  }
}
