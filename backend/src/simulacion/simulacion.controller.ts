import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SimulacionService } from './simulacion.service';
import { CreateSimulacionDto } from './dto/create-simulacion.dto';

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

    @UseGuards(JwtAuthGuard)
    @Post('guardar')
    async guardarSimulacion(@Request() req, @Body() createDto: CreateSimulacionDto) {
        const { rut } = req.user;
        // const rut = '333333333'; // Hardcode temporal si estás probando sin login real front
        return this.simulacionService.guardarSimulacionManual(rut, createDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('mis-guardadas')
    async obtenerLista(@Request() req) {
        const { rut } = req.user;
        return this.simulacionService.obtenerMisSimulaciones(rut);
    }

    @UseGuards(JwtAuthGuard)
    @Get('cargar/:id')
    async cargarSimulacion(@Request() req, @Param('id', ParseIntPipe) id: number) {
        const { rut } = req.user;
        return this.simulacionService.cargarSimulacionPorId(id, rut);
    }
}
