import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokensService } from './tokens.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { EmailVerificationToken } from './entities/email-verification-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken, EmailVerificationToken]),
  ],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}
