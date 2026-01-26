import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import {
  BankAccount,
  Transaction,
  OpenBankingToken,
  User,
  MissionSharedAccount,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([BankAccount, Transaction, OpenBankingToken, User, MissionSharedAccount]),
    HttpModule,
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
