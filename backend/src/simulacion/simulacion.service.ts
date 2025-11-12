import { Injectable, Logger } from '@nestjs/common';
import { MallaService } from '../malla/malla.service';
import { simularProgreso } from './simulacion-logic';

@Injectable()
export class SimulacionService {
    private readonly logger = new Logger(SimulacionService.name);

    constructor(
        private readonly mallaService: MallaService,
    ) { }

    /**
     * Simula la malla de un estudiante considerando los prerrequisitos
     * y el límite de 30 créditos por semestre.
     */
    async simularMalla(rut: string, codigoCarrera: string, catalogo: string) {
        this.logger.log(`🎓 Iniciando simulación de malla para RUT=${rut}, carrera=${codigoCarrera}, catálogo=${catalogo}`);

        try {
            // 1️⃣ Obtener malla con estado (desde Hawaii y avance)
            const malla = await this.mallaService.obtenerMallaConEstado(rut, codigoCarrera, catalogo);
            this.logger.log(`📘 Malla obtenida (${malla.length} cursos).`);

            // 2️⃣ Ejecutar simulación de avance
            this.logger.log('⚙️ Ejecutando simulación de progreso académico...');
            const simulacion = simularProgreso(malla);

            // 3️⃣ Resultado final
            this.logger.log(`✅ Simulación completada: ${simulacion.length} semestres generados.`);
            return { simulacion };
        } catch (error) {
            this.logger.error('❌ Error durante la simulación', error.stack || error.message);
            throw error;
        }
    }
}
