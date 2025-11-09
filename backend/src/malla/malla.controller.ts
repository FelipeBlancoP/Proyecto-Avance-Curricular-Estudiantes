import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { MallaService } from './malla.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Malla } from './dto/malla-api.interface';

@Controller('malla')
export class MallaController {
  constructor(private readonly mallaService: MallaService) { }

  @Get()
  async obtenerMalla(
    @Query('codigoCarrera') codigoCarrera: string,
    @Query('catalogo') catalogo: string,
  ): Promise<Malla> {
    return this.mallaService.obtenerMalla(codigoCarrera, catalogo);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mi-malla')
  async obtenerMiMalla(@Request() req) {
    const { carreras } = req.user;
    const carrera = carreras[0];
    return this.mallaService.obtenerMalla(carrera.codigo, carrera.catalogo);
  }

  @Get('mi-malla-con-estado')
  async obtenerMiMallaConEstado(
    @Query('rut') rut: string,
    @Query('codigoCarrera') codigoCarrera: string,
    @Query('catalogo') catalogo: string,
  ) {

    return this.mallaService.obtenerMallaConEstado(
      rut,
      codigoCarrera,
      catalogo,
    );
  }
}
