import { Carrera } from "../../estudiante/domain/estudiante.model";

export interface JwtPayload {
  sub: string; 
  rut: string;
  email: string;
  tipo: string;
  carreras: Carrera[];
}