import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Avance } from './domain/avance.model';
import { toAvancesDomain } from './adapters/avance.adapter';
import { Avance as AvanceAPI } from './dto/avance-api.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AvanceService {
  constructor(private readonly httpService: HttpService){}

  async avanceDelEstudiante(rut:string,codcarrera:string):Promise<Avance[]> {
    try{
      const response = await firstValueFrom(
        this.httpService.get<AvanceAPI[]>('avance.php', {
          params: { rut, codcarrera },
        }),
      ); 

      const apiData  = response.data;

      return toAvancesDomain(apiData);

    }
    catch (error) {
          if (error instanceof NotFoundException) {
            throw error;
          }
          console.error('Error al contactar la API externa:', error.message);
          throw new InternalServerErrorException('Error al obtener el avance del estudiante.');
        }

  }

}
