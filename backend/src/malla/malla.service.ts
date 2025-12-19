import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { AvanceService } from '../avance/avance.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Asignatura } from './entities/asignatura.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MallaService {
  constructor(
    private readonly configService: ConfigService,
    private readonly avanceService: AvanceService,

    @InjectRepository(Asignatura)
    private readonly asignaturaRepo: Repository<Asignatura>,
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
            console.warn('Error obteniendo avance, usando array vacío:', error.message);
            return [];
          })
      ]);

      const estadoPorCodigo = new Map<string, string>();

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
      console.error('Error en obtenerMallaConEstado:', error.message);
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

  async sincronizarCatalogo(codigoCarrera: string, catalogo: string) {
    console.log(`🔄 Iniciando sincronización para ${codigoCarrera}-${catalogo}...`);
    
    try {
      const mallaExterna = await this.obtenerMalla(codigoCarrera, catalogo);
      
      if (!mallaExterna || mallaExterna.length === 0) {
        return { mensaje: 'No se encontraron asignaturas en la API externa', total: 0 };
      }

      const asignaturasParaGuardar: Asignatura[] = mallaExterna.map((curso: any) => {
        const entity = new Asignatura();
        entity.codigo = curso.codigo;       
        entity.nombre = curso.asignatura;   
        entity.creditos = curso.creditos || 0; 
        entity.nivelMalla = curso.nivel || 0;
        
        return entity;
      });
      await this.asignaturaRepo.save(asignaturasParaGuardar);

      console.log(`Sincronización exitosa. ${asignaturasParaGuardar.length} cursos procesados.`);
      
      return { 
        mensaje: 'Catálogo sincronizado correctamente', 
        carrera: codigoCarrera,
        totalProcesados: asignaturasParaGuardar.length 
      };

    } catch (error) {
      console.error('Error en sincronización:', error);
      throw new HttpException(
        `Error al sincronizar catálogo: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
