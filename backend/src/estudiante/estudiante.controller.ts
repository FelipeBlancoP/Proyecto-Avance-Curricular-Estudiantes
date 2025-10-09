import { Controller, Get, Query, Param } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { Estudiante } from './domain/estudiante.model';

@Controller('estudiante')
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) {}

  @Get('login')
  async loginEstudiante(
    @Query('email') email: string,
    @Query('password') password: string,
  ): Promise<Estudiante> {
    return this.estudianteService.findEstudiantePorCredenciales(email, password);
  }
}