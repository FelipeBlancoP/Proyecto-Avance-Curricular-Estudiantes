import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../estudiante/dto/login.dto';
import { EstudianteService } from '../estudiante/estudiante.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly estudianteService: EstudianteService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(identifier: string, password: string): Promise<JwtPayload | null> {
    try {
      const estudiante = await this.estudianteService.findEstudiantePorCredenciales(identifier, password);
      
      if (!estudiante) {
        return null;
      }

      return {
        sub: estudiante.rut,
        rut: estudiante.rut,
        email: identifier,
        tipo: 'estudiante',
        carreras: estudiante.carreras,
      };
    } catch (error) {
      return null;
    }
  }

  async login(dto: LoginDto) {
    const payload = await this.validateUser(dto.identifier, dto.password);
    if (!payload) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = this.jwtService.sign(payload);
    
    return { 
      access_token: token, 
      expires_in: process.env.JWT_EXPIRES || '2h',
      user: {
        rut: payload.rut,
        email: payload.email,
        carreras: payload.carreras
      }
    };
  }
}