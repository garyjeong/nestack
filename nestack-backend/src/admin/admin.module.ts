import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminUser } from './entities/admin-user.entity';
import { Announcement } from './entities/announcement.entity';
import { AdminJwtGuard } from './guards/admin-jwt.guard';

// Import entities from other modules
import { User } from '../modules/users/entities/user.entity';
import { FamilyGroup } from '../modules/family/entities/family-group.entity';
import { Mission } from '../modules/missions/entities/mission.entity';
import { LifeCycleCategory } from '../modules/missions/entities/lifecycle-category.entity';
import { MissionTemplate } from '../modules/missions/entities/mission-template.entity';
import { Badge } from '../modules/badges/entities/badge.entity';
import { UserBadge } from '../modules/badges/entities/user-badge.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminUser,
      Announcement,
      User,
      FamilyGroup,
      Mission,
      LifeCycleCategory,
      MissionTemplate,
      Badge,
      UserBadge,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ADMIN_SECRET') ||
          configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '8h' },
      }),
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminJwtGuard],
  exports: [AdminService],
})
export class AdminModule {}
