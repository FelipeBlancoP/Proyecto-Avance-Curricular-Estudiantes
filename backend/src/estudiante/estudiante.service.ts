import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Estudiante as EstudianteApi } from './dto/estudiante-api.interface';
import { Estudiante } from './domain/estudiante.model';
import { toEstudianteDomain } from './adapters/estudiante.adapter';

@Injectable()
export class EstudianteService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * Obtiene los datos de un estudiante desde la API externa usando sus credenciales.
   * @param email Email del estudiante.
   * @param password Contraseña del estudiante.
   * @returns Una promesa con los datos del estudiante adaptados al modelo de dominio establecido.
   */
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

      return toEstudianteDomain(apiData);

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error al contactar la API externa:', error.message);
      throw new InternalServerErrorException('Error al obtener los datos del estudiante.');
    }
  }
}