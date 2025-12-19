import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MallaService } from '../malla/malla.service';
import { simularProgreso } from './simulacion-logic';
import { InjectRepository } from '@nestjs/typeorm';
import { Simulacion } from './entities/simulacion.entity';
import { Repository } from 'typeorm';
import { CreateSimulacionDto } from './dto/create-simulacion.dto';
import { SimulacionDetalle } from './entities/simulacion-detalle.entity';

@Injectable()
export class SimulacionService {
    private readonly logger = new Logger(SimulacionService.name);

    constructor(
        private readonly mallaService: MallaService,
        @InjectRepository(Simulacion)
        private readonly simulacionRepo: Repository<Simulacion>
    ) { }

    async simularMalla(rut: string, codigoCarrera: string, catalogo: string) {
        this.logger.log(`🎓 Iniciando simulación de malla para RUT=${rut}, carrera=${codigoCarrera}, catálogo=${catalogo}`);

        try {
            
            const malla = await this.mallaService.obtenerMallaConEstado(rut, codigoCarrera, catalogo);
            this.logger.log(`Malla obtenida (${malla.length} cursos).`);

            
            this.logger.log('Ejecutando simulación de progreso académico...');
            const simulacion = simularProgreso(malla);

            
            this.logger.log(`Simulación completada: ${simulacion.length} semestres generados.`);
            return { simulacion };
        } catch (error) {
            this.logger.error('Error durante la simulación', error.stack || error.message);
            throw error;
        }
    }

    async guardarSimulacionManual(rutEstudiante: string, dto: CreateSimulacionDto) {
        try {
            // 1. Crear la cabecera
            const nuevaSimulacion = this.simulacionRepo.create({
                rutEstudiante,
                nombre: dto.nombre,
                // detalles se llenarán abajo
            });

            // 2. Aplanar la estructura: De Semestres[] a Detalles[]
            const detalles: SimulacionDetalle[] = [];

            dto.semestres.forEach(semestre => {
                semestre.cursos.forEach(curso => {
                    const detalle = new SimulacionDetalle();
                    detalle.codigoAsignatura = curso.codigo;
                    detalle.semestreSimulado = semestre.id; // El número del semestre (1, 2...)
                    detalles.push(detalle);
                });
            });

            // Asignamos los detalles a la simulación (Cascade se encargará de guardarlos)
            nuevaSimulacion.detalles = detalles;

            // 3. Guardar en BD
            const guardada = await this.simulacionRepo.save(nuevaSimulacion);
            
            return { message: 'Simulación guardada', id: guardada.id };

        } catch (error) {
            this.logger.error('Error guardando simulación', error);
            // Tip: Si falla por FK es porque el código de asignatura no está sincronizado
            throw new BadRequestException('Error al guardar. Verifica que las asignaturas existan en el catálogo.');
        }
    }

    async obtenerMisSimulaciones(rutEstudiante: string) {
        return this.simulacionRepo.find({
            where: { rutEstudiante },
            order: { fechaCreacion: 'DESC' },
            select: ['id', 'nombre', 'fechaCreacion'] // Solo datos básicos para listar
        });
    }

    // ==========================================
    // 📖 CARGAR UNA SIMULACIÓN (Formato SimulacionView)
    // ==========================================
    async cargarSimulacionPorId(id: number, rutEstudiante: string) {
        // 1. Buscar con relaciones (JOIN)
        const simulacion = await this.simulacionRepo.findOne({
            where: { id, rutEstudiante }, // Seguridad: que sea del usuario
            relations: ['detalles', 'detalles.asignatura'] // <--- CLAVE: Traemos los datos de la asignatura (nombre, creditos)
        });

        if (!simulacion) throw new NotFoundException('Simulación no encontrada');

        // 2. Transformar al formato que espera SimulacionView.tsx
        // Formato esperado: [{ numero: 1, creditos: X, cursos: [...] }, ...]

        const mapaSemestres = new Map<number, any>();

        simulacion.detalles.forEach(detalle => {
            const numSemestre = detalle.semestreSimulado;
            const asignaturaData = detalle.asignatura; // Datos cacheados en BD local

            // Inicializar semestre si no existe
            if (!mapaSemestres.has(numSemestre)) {
                mapaSemestres.set(numSemestre, {
                    numero: numSemestre,
                    creditos: 0,
                    cursos: []
                });
            }

            const semestreActual = mapaSemestres.get(numSemestre);

            // Sumar créditos (usando el dato de la BD local)
            const creditosCurso = asignaturaData ? asignaturaData.creditos : 0;
            semestreActual.creditos += creditosCurso;

            // Agregar curso formateado
            semestreActual.cursos.push({
                codigo: detalle.codigoAsignatura,
                // Si por alguna razón no está sincronizada la asignatura, usamos el código como nombre fallback
                nombre: asignaturaData ? asignaturaData.nombre : 'Asignatura Desconocida', 
                nivel: numSemestre, // En la vista simulada, el nivel es el semestre donde se puso
                creditos: creditosCurso,
                prereq: [], // En simulación guardada no solemos re-validar prerequisitos visualmente, o podrías traerlos si quieres
                estado: 'simulado'
            });
        });

        // 3. Convertir Mapa a Array y Ordenar
        const simulacionFormateada = Array.from(mapaSemestres.values())
            .sort((a, b) => a.numero - b.numero);

        // Retornamos estructura igual a la automática
        return { 
            nombre: simulacion.nombre, // Extra: enviamos el nombre por si quieres mostrarlo
            simulacion: simulacionFormateada 
        };
    }
}
