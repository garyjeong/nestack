import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionsController } from './missions.controller';
import { MissionsService } from './missions.service';
import { Mission } from './entities/mission.entity';
import { MissionTemplate } from './entities/mission-template.entity';
import { LifeCycleCategory } from './entities/lifecycle-category.entity';
import { MissionSharedAccount } from './entities/mission-shared-account.entity';
import { Transaction } from '../finance/entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Mission,
      MissionTemplate,
      LifeCycleCategory,
      MissionSharedAccount,
      Transaction,
    ]),
  ],
  controllers: [MissionsController],
  providers: [MissionsService],
  exports: [MissionsService],
})
export class MissionsModule {}
