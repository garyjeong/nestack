import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { OpenBankingService } from './openbanking.service';
import { OpenBankingMockService } from './openbanking-mock.service';
import { OPENBANKING_SERVICE } from './openbanking.interface';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
  ],
  providers: [
    {
      provide: OPENBANKING_SERVICE,
      useFactory: (configService: ConfigService) => {
        const useMock = configService.get('openbanking.useMock') === true ||
                       configService.get('openbanking.useMock') === 'true' ||
                       process.env.NODE_ENV === 'development';

        if (useMock) {
          return new OpenBankingMockService();
        }
        return new OpenBankingService(
          new (require('@nestjs/axios').HttpService)(),
          configService,
        );
      },
      inject: [ConfigService],
    },
    OpenBankingService,
    OpenBankingMockService,
  ],
  exports: [OPENBANKING_SERVICE],
})
export class OpenBankingModule {}
