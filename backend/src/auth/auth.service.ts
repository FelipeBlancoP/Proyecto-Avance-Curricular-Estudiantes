import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../estudiante/dto/login.dto';
import { EstudianteService } from '../estudiante/estudiante.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly estudianteService: EstudianteService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(identifier: string, password: string): Promise<any | null> {
    try {
      // Usar directamente el servicio que llama a la API externa
      const estudiante = await this.estudianteService.findEstudiantePorCredenciales(identifier, password);
      
      // Si llegamos aquí, las credenciales son válidas
      // porque el servicio no lanzó una excepción
      return {
        sub: estudiante.rut, // Usar rut como subject
        rut: estudiante.rut,
        email: identifier, // Usar el identifier que se envió
        tipo: 'estudiante',
        carreras: estudiante.carreras,
      };
    } catch (error) {
      // Si hay cualquier error, las credenciales son inválidas
      console.error('Error en validación:', error.message);
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