import { Controller, Get, Query } from '@nestjs/common';
import { AvanceService } from './avance.service';
import { Avance } from './domain/avance.model';

@Controller('avance')
export class AvanceController {
  constructor(private readonly avanceService: AvanceService) {}

  @Get()
  async obtenerAvance(
    @Query('rut') rut: string,
    @Query('codcarrera') codcarrera: string
  ): Promise<Avance[]> {
    return this.avanceService.avanceDelEstudiante(rut,codcarrera);
  }
}
