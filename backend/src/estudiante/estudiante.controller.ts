import { Controller, Get, Query, Param, UseGuards, Request } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { Estudiante } from './domain/estudiante.model';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('estudiante')
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) {}

  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  async getPerfil(@Request() req: any) {
    return {
      rut: req.user.rut,
      email: req.user.email,
      carreras: req.user.carreras
    };
  }
}