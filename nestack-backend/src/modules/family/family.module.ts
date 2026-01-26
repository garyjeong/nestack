import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyController } from './family.controller';
import { FamilyService } from './family.service';
import {
  User,
  FamilyGroup,
  InviteCode,
  BankAccount,
  Mission,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, FamilyGroup, InviteCode, BankAccount, Mission]),
  ],
  controllers: [FamilyController],
  providers: [FamilyService],
  exports: [FamilyService],
})
export class FamilyModule {}
