export interface Avance {
    nrc:             string;
    period:          string;
    student:         string;
    course:          string;
    excluded:        boolean;
    inscriptionType: InscriptionType;
    status:          Status;
}

export enum InscriptionType {
    Regular = "REGULAR",
}

export enum Status {
    Aprobado = "APROBADO",
    Inscrito = "INSCRITO",
    Reprobado = "REPROBADO",
}
