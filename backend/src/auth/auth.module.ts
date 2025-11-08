import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { EstudianteModule } from '../estudiante/estudiante.module';
import { TokenBlacklistService } from './token-blacklist.service';

@Module({
  imports: [
    EstudianteModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'clave-super-secreta', 
      signOptions: { expiresIn: '2h' },
    }),
  ],
  providers: [AuthService, JwtStrategy, TokenBlacklistService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}