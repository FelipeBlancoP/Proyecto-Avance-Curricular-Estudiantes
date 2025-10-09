import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EstudianteService } from '../estudiante/estudiante.service'; 

@Injectable()
export class AuthService {
  constructor(
    private estudianteService: EstudianteService,
    private jwtService: JwtService,
  ) {}


  async loginEstudiante(email: string, password: string) {
    const estudiante = await this.estudianteService.findEstudiantePorCredenciales(email, password);

    const payload = { 
      rut: estudiante.rut,
      sub: estudiante.rut,
      tipo: 'estudiante',
      email: email,
      carreras: estudiante.carreras,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      estudiante: estudiante
    };
  }
}
