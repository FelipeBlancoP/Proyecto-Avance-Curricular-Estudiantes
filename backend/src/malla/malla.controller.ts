import { Controller, Get, Query, UseGuards, Request, Post } from '@nestjs/common';
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
  
  @UseGuards(JwtAuthGuard)
  @Get('mi-malla-con-estado-auth')
  async obtenerMiMallaConEstadoAuth(
    @Request() req,
    @Query('codigoCarrera') codigoCarrera?: string, 
    @Query('catalogo') catalogo?: string
  ) {
    const { rut, carreras } = req.user;
    console.log('🚨 RUT que viene en el Token (incorrecto):', rut);
    const rutReal = '333333333';
    const carreraCode = '8266'; 
    const catalog = '202410';
    if (!rut || !carreraCode) {
        throw new Error("Datos de usuario incompletos en el token");
    }

    return this.mallaService.obtenerMallaConEstado(
      rutReal,
      carreraCode,
      catalog,
    );
  }

  @Post('sincronizar')
  async sincronizarBD(
    @Query('codigoCarrera') codigoCarrera: string, 
    @Query('catalogo') catalogo: string
  ) {
    const carrera = codigoCarrera; 
    const cat = catalogo;        

    return this.mallaService.sincronizarCatalogo(carrera, cat);
  }

}