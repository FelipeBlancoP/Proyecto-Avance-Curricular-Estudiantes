import { Estudiante as EstudianteApi } from '../dto/estudiante-api.interface';
import { Estudiante } from '../domain/estudiante.model';

export function toEstudianteDomain(apiData: EstudianteApi): Estudiante {
  return {
    rut: apiData.rut,
    carreras: apiData.carreras.map(carreraApi => ({
      codigo: carreraApi.codigo,
      nombre: carreraApi.nombre,
      catalogo: carreraApi.catalogo,
    })),
  };
}