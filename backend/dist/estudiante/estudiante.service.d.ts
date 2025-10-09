import { HttpService } from '@nestjs/axios';
import { Estudiante } from './domain/estudiante.model';
export declare class EstudianteService {
    private readonly httpService;
    constructor(httpService: HttpService);
    findEstudiantePorCredenciales(email: string, password: string): Promise<Estudiante>;
}
