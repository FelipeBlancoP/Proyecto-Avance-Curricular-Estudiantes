import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { AvanceService } from '../avance/avance.service';

@Injectable()
export class MallaService {
  constructor(
    private readonly configService: ConfigService,
    private readonly avanceService: AvanceService,
  ) { }

  async obtenerMalla(codigoCarrera: string, catalogo: string) {
    try {
      const url = `https://losvilos.ucn.cl/hawaii/api/mallas?${codigoCarrera}-${catalogo}`;
      const { data } = await axios.get(url, {
        headers: {
          'X-HAWAII-AUTH': this.configService.get<string>('HAWAII_AUTH'),
        },
      });

      const malla = data.map((curso: any) => ({
        ...curso,
        prereq: curso.prereq
          ? curso.prereq.split(',').map((p: string) => p.trim())
          : [],
      }));

      return malla;
    } catch (error) {
      console.error('Error al obtener malla:', error.message);
      throw new HttpException(
        `Error al obtener malla curricular: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async obtenerMallaConEstado(
    rut: string,
    codigoCarrera: string,
    catalogo: string,
  ) {
    try {
      const [malla, avances] = await Promise.all([
        this.obtenerMalla(codigoCarrera, catalogo),
        this.avanceService.avanceDelEstudiante(rut, codigoCarrera)
          .catch(error => {
            console.warn('⚠️ Error obteniendo avance, usando array vacío:', error.message);
            return []; // Si falla el avance, usar array vacío
          })
      ]);

      const estadoPorCodigo = new Map<string, string>();

      // Solo procesar si avances es un array
      if (Array.isArray(avances)) {
        for (const a of avances) {
          if (a && a.course) {
            estadoPorCodigo.set(a.course, a.status || 'No cursado');
          }
        }
      }

      return malla.map((asig) => ({
        ...asig,
        estado: estadoPorCodigo.get(asig.codigo) ?? 'No cursado',
      }));
    } catch (error) {
      console.error('❌ Error en obtenerMallaConEstado:', error.message);
      // Si falla todo, devolver solo la malla básica
      const malla = await this.obtenerMalla(codigoCarrera, catalogo);
      return malla.map(asig => ({
        ...asig,
        estado: 'No cursado'
      }));
    }

  }

  async calcularAvance(
    rut: string,
    codigoCarrera: string,
    catalogo: string,
  ) {
    const malla = await this.obtenerMallaConEstado(
      rut,
      codigoCarrera,
      catalogo,
    );

    const creditosTotales = malla.reduce(
      (acc, asig) => acc + (asig.creditos || 0),
      0,
    );

    const creditosAprobados = malla
      .filter(a => a.estado?.toLowerCase() === 'aprobado')
      .reduce((acc, asig) => acc + (asig.creditos || 0), 0);

    const porcentaje =
      creditosTotales === 0
        ? 0
        : Math.round((creditosAprobados / creditosTotales) * 100);

    return {
      porcentaje,
      creditosAprobados,
      creditosTotales,
    };
  }
}
