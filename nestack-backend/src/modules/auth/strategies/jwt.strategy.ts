import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { UserStatus } from '../../../common/enums';
import { JwtPayload } from '../../../common/interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.accessSecret') || 'fallback-secret',
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type !== 'access') {
      throw new BusinessException('AUTH_002');
    }

    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new BusinessException('USER_003');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new BusinessException('AUTH_006');
    }

    if (user.status === UserStatus.WITHDRAWN) {
      throw new BusinessException('AUTH_007');
    }

    return user;
  }
}
