import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import {
  AdminUser,
  User,
  FamilyGroup,
  Mission,
  LifeCycleCategory,
  MissionTemplate,
  Badge,
  UserBadge,
  Announcement,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminUser,
      User,
      FamilyGroup,
      Mission,
      LifeCycleCategory,
      MissionTemplate,
      Badge,
      UserBadge,
      Announcement,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
