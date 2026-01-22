import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Config
import { ConfigModule } from './config/config.module';
import { ConfigService } from '@nestjs/config';

// Database
import { DatabaseModule } from './database/database.module';

// Guards
import { JwtAuthGuard } from './common/guards';

// Controllers
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TokensModule } from './modules/tokens/tokens.module';
import { MailModule } from './modules/mail/mail.module';
import { FamilyModule } from './modules/family/family.module';
import { MissionsModule } from './modules/missions/missions.module';
import { FinanceModule } from './modules/finance/finance.module';
import { BadgesModule } from './modules/badges/badges.module';
import { EventsModule } from './modules/events/events.module';

// Admin Module
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // Global Configuration
    ConfigModule,

    // Database
    DatabaseModule,

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          name: 'short',
          ttl: 1000,
          limit: 3,
        },
        {
          name: 'medium',
          ttl: 10000,
          limit: 20,
        },
        {
          name: 'long',
          ttl: configService.get<number>('throttle.ttl') || 60000,
          limit: configService.get<number>('throttle.limit') || 100,
        },
      ],
    }),

    // Event Emitter for internal events (badge issuance, etc.)
    EventEmitterModule.forRoot(),

    // Feature Modules
    AuthModule,
    UsersModule,
    TokensModule,
    MailModule,
    FamilyModule,
    MissionsModule,
    FinanceModule,
    BadgesModule,
    EventsModule,

    // Admin Module
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // Global Guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
