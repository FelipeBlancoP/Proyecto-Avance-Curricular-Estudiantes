import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SimulacionService } from './simulacion.service';

@Controller('simulacion')
export class SimulacionController {
    constructor(private readonly simulacionService: SimulacionService) { }

    @Get('mi-simulacion')
    async simularMalla(
        @Query('rut') rut: string,
        @Query('codigoCarrera') codigoCarrera: string,
        @Query('catalogo') catalogo: string,
    ) {
        return this.simulacionService.simularMalla(rut, codigoCarrera, catalogo);
    }
}
