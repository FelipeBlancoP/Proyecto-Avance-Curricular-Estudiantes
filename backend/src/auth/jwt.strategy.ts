import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly blacklistService: TokenBlacklistService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'clave-super-secreta',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req as any);
    
    if (token && this.blacklistService.isBlacklisted(token)) {
      throw new UnauthorizedException('Token revocado');
    }

    return {
      rut: payload.rut,
      email: payload.email,
      tipo: payload.tipo || 'estudiante',
      carreras: payload.carreras,
      userId: payload.sub
    };
  }
}