import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AvanceService } from './avance.service';
import { Avance } from './domain/avance.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('avance')
export class AvanceController {
  constructor(private readonly avanceService: AvanceService) {}

  //Obtener avance versión no protegida
  @Get()
  async obtenerAvance(
    @Query('rut') rut: string,
    @Query('codcarrera') codcarrera: string
  ): Promise<Avance[]> {
    return this.avanceService.avanceDelEstudiante(rut,codcarrera);
  }

  //Obtener avance versión protegida
  @UseGuards(JwtAuthGuard)
  @Get('mi-avance')
  async obtenerMiAvance(@Request() req):Promise<Avance[]> {
    const { rut, carreras } = req.user;

    const carrera = carreras[0];

    return this.avanceService.avanceDelEstudiante(rut, carrera.codigo);

  }
}
