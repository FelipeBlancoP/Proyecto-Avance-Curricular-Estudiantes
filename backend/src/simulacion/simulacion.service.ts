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
        this.logger.log(`Iniciando simulación de malla para RUT=${rut}, carrera=${codigoCarrera}, catálogo=${catalogo}`);

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
            const nuevaSimulacion = this.simulacionRepo.create({
                rutEstudiante,
                nombre: dto.nombre,
            });
            const detalles: SimulacionDetalle[] = [];

            dto.semestres.forEach(semestre => {
                semestre.cursos.forEach(curso => {
                    const detalle = new SimulacionDetalle();
                    detalle.codigoAsignatura = curso.codigo;
                    detalle.semestreSimulado = semestre.id;
                    detalles.push(detalle);
                });
            });
            nuevaSimulacion.detalles = detalles;

            const guardada = await this.simulacionRepo.save(nuevaSimulacion);
            
            return { message: 'Simulación guardada', id: guardada.id };

        } catch (error) {
            this.logger.error('Error guardando simulación', error);
            throw new BadRequestException('Error al guardar. Verifica que las asignaturas existan en el catálogo.');
        }
    }

    async obtenerMisSimulaciones(rutEstudiante: string) {
        return this.simulacionRepo.find({
            where: { rutEstudiante },
            order: { fechaCreacion: 'DESC' },
            select: ['id', 'nombre', 'fechaCreacion']
        });
    }

    async cargarSimulacionPorId(id: number, rutEstudiante: string) {
        const simulacion = await this.simulacionRepo.findOne({
            where: { id, rutEstudiante },
            relations: ['detalles', 'detalles.asignatura'] 
        });

        if (!simulacion) throw new NotFoundException('Simulación no encontrada');


        const mapaSemestres = new Map<number, any>();

        simulacion.detalles.forEach(detalle => {
            const numSemestre = detalle.semestreSimulado;
            const asignaturaData = detalle.asignatura;

            if (!mapaSemestres.has(numSemestre)) {
                mapaSemestres.set(numSemestre, {
                    numero: numSemestre,
                    creditos: 0,
                    cursos: []
                });
            }

            const semestreActual = mapaSemestres.get(numSemestre);

            const creditosCurso = asignaturaData ? asignaturaData.creditos : 0;
            semestreActual.creditos += creditosCurso;

            semestreActual.cursos.push({
                codigo: detalle.codigoAsignatura,
                nombre: asignaturaData ? asignaturaData.nombre : 'Asignatura Desconocida', 
                nivel: numSemestre,
                creditos: creditosCurso,
                prereq: [],
                estado: 'simulado'
            });
        });
        const simulacionFormateada = Array.from(mapaSemestres.values())
            .sort((a, b) => a.numero - b.numero);

        return { 
            nombre: simulacion.nombre,
            simulacion: simulacionFormateada 
        };
    }
}
