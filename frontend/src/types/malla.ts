export interface Asignatura {
  codigo:     string;
  asignatura: string;
  creditos:   number;
  nivel:      number;
  prereq:     string;
}

// La Malla es un ARRAY de Asignaturas
export type Malla = Asignatura[];