import { Controller, Get, Query, Param, UseGuards, Request } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { Estudiante } from './domain/estudiante.model';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MallaService } from '../malla/malla.service';

@Controller('estudiante')
export class EstudianteController {
  constructor(
    private readonly estudianteService: EstudianteService,
    private readonly mallaService: MallaService,
  ) { }

  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  async getPerfil(@Request() req: any) {
    return {
      rut: req.user.rut,
      email: req.user.email,
      carreras: req.user.carreras
    };
  }

  @Get('avance')
  @UseGuards(JwtAuthGuard)
  async getAvance(@Request() req: any) {
    const { rut, carreras } = req.user;

    if (!carreras || carreras.length === 0) {
      return {
        porcentaje: 0,
        creditosAprobados: 0,
        creditosTotales: 0,
      };
    }

    const { codigo, catalogo } = carreras[0];

    return this.mallaService.calcularAvance(
      rut,
      codigo,
      catalogo,
    );
  }
}