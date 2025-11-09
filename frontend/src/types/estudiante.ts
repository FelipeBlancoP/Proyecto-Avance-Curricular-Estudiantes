export interface Carrera {
  codigo: string;
  nombre: string;
  catalogo: string;
}

export interface Estudiante {
  rut: string;
  email: string;
  carreras: Carrera[];
}

export interface AvanceCurso {
  nrc: string;
  period: string;
  student: string;
  course: string;
  excluded: boolean;
  inscriptionType: string;
  status: string;
}