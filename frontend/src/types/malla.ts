export interface Asignatura {
  codigo: string;
  asignatura: string;
  creditos: number;
  nivel: number;
  prereq: string | string[];
  estado: string;
}

export type Malla = Asignatura[];