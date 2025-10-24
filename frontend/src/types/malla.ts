export interface Asignatura {
  codigo:     string;
  asignatura: string;
  creditos:   number;
  nivel:      number;
  prereq:     string;
}

export type Malla = Asignatura[];