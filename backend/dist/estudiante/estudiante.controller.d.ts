import { EstudianteService } from './estudiante.service';
import { Estudiante } from './domain/estudiante.model';
export declare class EstudianteController {
    private readonly estudianteService;
    constructor(estudianteService: EstudianteService);
    loginEstudiante(email: string, password: string): Promise<Estudiante>;
}
