import { ConfigService } from '@nestjs/config';
export declare class MallaService {
    private readonly configService;
    constructor(configService: ConfigService);
    obtenerMalla(codigoCarrera: string): Promise<any>;
}
