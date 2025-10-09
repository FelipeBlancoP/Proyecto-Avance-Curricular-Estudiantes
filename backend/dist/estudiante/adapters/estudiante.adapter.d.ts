import { Estudiante as EstudianteApi } from '../dto/estudiante-api.interface';
import { Estudiante } from '../domain/estudiante.model';
export declare function toEstudianteDomain(apiData: EstudianteApi): Estudiante;
