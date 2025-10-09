import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MallaService {
  constructor(private readonly configService: ConfigService) {}

  async obtenerMalla(codigoCarrera: string) {
    try {
      const url = `https://losvilos.ucn.cl/hawaii/api/mallas?${codigoCarrera}`;

      const { data } = await axios.get(url, {
        headers: {
          'X-HAWAII-AUTH': this.configService.get<string>('HAWAII_AUTH'),
        },
      });

      return data;
    } catch (error) {
      console.error('Error al obtener malla:', error.message);
      throw new HttpException(
        `Error al obtener malla curricular: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
