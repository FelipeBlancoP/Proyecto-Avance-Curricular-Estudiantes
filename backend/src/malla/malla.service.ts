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

  async sincronizarCatalogo(codigoCarrera: string, catalogo: string) {
    console.log(`🔄 Iniciando sincronización para ${codigoCarrera}-${catalogo}...`);
    
    try {
      // 1. Obtenemos la malla "cruda" de la API externa (usamos tu método existente)
      // Nota: Tu método obtenerMalla devuelve { codigo, asignatura, creditos, nivel, prereq... }
      const mallaExterna = await this.obtenerMalla(codigoCarrera, catalogo);
      
      if (!mallaExterna || mallaExterna.length === 0) {
        return { mensaje: 'No se encontraron asignaturas en la API externa', total: 0 };
      }

      // 2. Preparamos las entidades para guardar
      const asignaturasParaGuardar: Asignatura[] = mallaExterna.map((curso: any) => {
        const entity = new Asignatura();
        entity.codigo = curso.codigo;       // PK
        entity.nombre = curso.asignatura;   // Nombre del ramo
        entity.creditos = curso.creditos || 0; 
        entity.nivelMalla = curso.nivel || 0;
        
        return entity;
      });

      // 3. Guardado Inteligente (UPSERT)
      // .save() verifica la PK (codigo). Si existe, actualiza los campos. Si no, inserta.
      // Esto maneja perfectamente el caso de "Cálculo I" compartido entre carreras.
      // Si ya existía por ICCI, al sincronizar ITI solo actualizará el nombre/créditos (que deberían ser iguales).
      await this.asignaturaRepo.save(asignaturasParaGuardar);

      console.log(`✅ Sincronización exitosa. ${asignaturasParaGuardar.length} cursos procesados.`);
      
      return { 
        mensaje: 'Catálogo sincronizado correctamente', 
        carrera: codigoCarrera,
        totalProcesados: asignaturasParaGuardar.length 
      };

    } catch (error) {
      console.error('❌ Error en sincronización:', error);
      throw new HttpException(
        `Error al sincronizar catálogo: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
