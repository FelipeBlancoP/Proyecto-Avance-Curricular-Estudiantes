import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Estudiante as EstudianteEntity } from './entities/estudiante.entity';
import { Estudiante as EstudianteApi } from './dto/estudiante-api.interface';
import { Estudiante } from './domain/estudiante.model';
import { toEstudianteDomain } from './adapters/estudiante.adapter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EstudianteService {
  constructor(
    private readonly httpService: HttpService,
    
    @InjectRepository(EstudianteEntity)
    private readonly estudianteRepo: Repository<EstudianteEntity>,
  ) {}

  async findEstudiantePorCredenciales(email: string, password: string): Promise<Estudiante> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<EstudianteApi>('login.php', {
          params: { email, password },
        }),
      );

      const apiData = response.data;

      if (!apiData || !apiData.rut) {
        throw new NotFoundException(`Credenciales incorrectas o estudiante no encontrado.`);
      }

      await this.validarOCrearEstudiante(apiData.rut, email);

      return toEstudianteDomain(apiData);

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error al contactar la API externa:', error.message);
      throw new InternalServerErrorException('Error al obtener los datos del estudiante.');
    }
  }

  private async validarOCrearEstudiante(rut: string, email: string): Promise<void> {
    try {
      const existe = await this.estudianteRepo.findOneBy({ rut });

      if (!existe) {
        console.log(`🆕 Estudiante nuevo detectado (${rut}). Creando en BD local...`);
        
        const nuevoEstudiante = new EstudianteEntity();
        nuevoEstudiante.rut = rut;
        nuevoEstudiante.email = email;

        await this.estudianteRepo.save(nuevoEstudiante);
      }

    } catch (dbError) {
      console.error('Error al sincronizar estudiante en BD local:', dbError);
    }
  }
}