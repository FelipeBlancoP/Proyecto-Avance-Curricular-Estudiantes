import { Controller, Get, UseGuards, Request, Param } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('estudiante')
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) {}

  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  async getPerfil(@Request() req: any) {
    // El usuario viene del JWT token después de la autenticación
    return {
      rut: req.user.rut,
      email: req.user.email,
      carreras: req.user.carreras
    };
  }

  @Get('malla/:codigoCarrera')
  @UseGuards(JwtAuthGuard)
  async getMalla(
    @Request() req: any,
    @Param('codigoCarrera') codigoCarrera: string
  ) {
    // Buscar la carrera en las carreras del estudiante para obtener el catálogo
    const carrera = req.user.carreras.find((c: any) => c.codigo === codigoCarrera);
    if (!carrera) {
      throw new Error('Carrera no encontrada para este estudiante');
    }
    
    return this.estudianteService.obtenerMalla(codigoCarrera, carrera.catalogo);
  }

  @Get('avance/:codigoCarrera')
  @UseGuards(JwtAuthGuard)
  async getAvance(
    @Request() req: any,
    @Param('codigoCarrera') codigoCarrera: string
  ) {
    return this.estudianteService.obtenerAvance(req.user.rut, codigoCarrera);
  }
}