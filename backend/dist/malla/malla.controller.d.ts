import { MallaService } from './malla.service';
export declare class MallaController {
    private readonly mallaService;
    constructor(mallaService: MallaService);
    obtenerMalla(codigoCarrera: string): Promise<any>;
}
