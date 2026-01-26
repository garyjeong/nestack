import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgesController } from './badges.controller';
import { BadgesService } from './badges.service';
import { Badge, UserBadge, User, Mission } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Badge, UserBadge, User, Mission])],
  controllers: [BadgesController],
  providers: [BadgesService],
  exports: [BadgesService],
})
export class BadgesModule {}
