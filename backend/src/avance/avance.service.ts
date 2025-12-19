import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Avance } from './domain/avance.model';
import { toAvancesDomain } from './adapters/avance.adapter';
import { Avance as AvanceAPI } from './dto/avance-api.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AvanceService {
  constructor(private readonly httpService: HttpService){}

  async avanceDelEstudiante(rut: string, codcarrera: string): Promise<Avance[]> {
    try{
      console.log('Llamando a API avance con:', { rut, codcarrera });
      
      const url = `https://puclaro.ucn.cl/eross/avance/avance.php?rut=${rut}&codcarrera=${codcarrera}`;
      
      const response = await firstValueFrom(
        this.httpService.get<AvanceAPI[]>(url)
      ); 

      const apiData = response.data;

      if (apiData && typeof apiData === 'object' && 'error' in apiData) {
        console.warn('API avance devolvió error:', apiData.error);
        return [];
      }

      console.log('Avance obtenido:', Array.isArray(apiData) ? apiData.length : 'no-array');
      return toAvancesDomain(apiData || []);

    } catch (error) {
      console.error('Error en avanceDelEstudiante:', error.message);
      
      if (error.response?.status === 404 || error.response?.data?.error) {
        console.log('No se encontró avance, devolviendo array vacío');
        return [];
      }
      
      throw new InternalServerErrorException('Error al obtener el avance del estudiante.');
    }
  }
}