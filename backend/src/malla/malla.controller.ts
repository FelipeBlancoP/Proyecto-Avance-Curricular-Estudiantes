import { Controller, Get, Query } from '@nestjs/common';
import { MallaService } from './malla.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller('malla')
export class MallaController {
  constructor(private readonly mallaService: MallaService) {}

  @Get()
  async obtenerMalla(
    @Query('codigoCarrera') codigoCarrera: string,
    @Query('catalogo') catalogo: string,
  ) {
    return this.mallaService.obtenerMalla(codigoCarrera, catalogo);
  }

  @UseGuards(JwtAuthGuard)
  @Get('protegida')
  getMallaProtegida() {
    return { mensaje: 'Solo accesible con token válido 🔒' };
  }
}