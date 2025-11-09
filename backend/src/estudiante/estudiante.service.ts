import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Estudiante as EstudianteApi } from './dto/estudiante-api.interface';
import { Estudiante } from './domain/estudiante.model';
import { toEstudianteDomain } from './adapters/estudiante.adapter';

@Injectable()
export class EstudianteService {
  constructor(private readonly httpService: HttpService) {}

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
  async obtenerMalla(codigoCarrera: string, catalogo: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://losvilos.ucn.cl/hawaii/api/mallas?${codigoCarrera}-${catalogo}`, {
          headers: {
            'X-HAWAII-AUTH': 'jf400fejof13f'
          }
        })
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener malla:', error.message);
      throw new InternalServerErrorException('Error al obtener la malla curricular');
    }
  }

  async obtenerAvance(rut: string, codigoCarrera: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://puclaro.ucn.cl/eross/avance/avance.php?rut=${rut}&codcarrera=${codigoCarrera}`)
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener avance:', error.message);
      throw new InternalServerErrorException('Error al obtener el avance curricular');
    }
  }
}