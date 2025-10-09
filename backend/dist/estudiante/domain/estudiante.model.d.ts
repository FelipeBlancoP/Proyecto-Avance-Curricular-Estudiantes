export interface Carrera {
    codigo: string;
    nombre: string;
    catalogo: string;
}
export interface Estudiante {
    rut: string;
    carreras: Carrera[];
}
