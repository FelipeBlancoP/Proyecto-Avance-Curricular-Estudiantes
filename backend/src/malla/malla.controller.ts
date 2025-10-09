import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { MallaService } from './malla.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('malla')
export class MallaController {
  constructor(private readonly mallaService: MallaService) {}

  //Malla no protegida, obtenible directamente (para pruebas?)
  @Get()
  async obtenerMalla(
    @Query('codigoCarrera') codigoCarrera: string,
    @Query('catalogo') catalogo: string,
  ) {
    return this.mallaService.obtenerMalla(codigoCarrera, catalogo);
  }

  //Malla protegida, saca los datos del usuario logueado
  @UseGuards(JwtAuthGuard)
  @Get('mi-malla')
  async obtenerMiMalla(@Request() req) {
    const { carreras } = req.user;
    
    const carrera = carreras[0];
    
    return this.mallaService.obtenerMalla(carrera.codigo, carrera.catalogo);
  }
}