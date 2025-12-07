import { useEffect, useMemo, useState } from "react";
import { obtenerSimulacion } from "../../services/simulacionService";
import { Asignatura } from "../../types/malla";
import MallaTimeline from "../MallaTimeline/MallaTimeline";
import { Semestre } from "../../pages/MallaPage/mallaPage";
import "./SimulacionView.css";

interface Props {
    rut: string;
    codigoCarrera: string;
    catalogo: string;
    token: string;
    malla: Asignatura[];
}

function calcularEtiquetaSimulacion(simulacionIndex: number): string {
    const today = new Date();
    const month = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    let startSemestre: number;
    let startYear: number;

    if (month >= 4 && month <= 8) {
        startSemestre = 2;
        startYear = currentYear;
    }

    else if (month >= 9 && month <= 12) {
        startSemestre = 1;
        startYear = currentYear + 1;
    } 

    else {
        startSemestre = 1;
        startYear = currentYear;
    }

    let targetSemestre = startSemestre;
    let targetYear = startYear;

    for (let i = 0; i < simulacionIndex; i++) {
        if (targetSemestre === 1) {
            targetSemestre = 2;
        } else {
            targetSemestre = 1;
            targetYear++;
        }
    }

    const semestreLabel = targetSemestre === 1 ? "I" : "II";
    return `${semestreLabel} - ${targetYear}`;
}

function SimulacionView({ rut, codigoCarrera, catalogo, token, malla }: Props) {
    const [simulacionAPI, setSimulacionAPI] = useState<any[]>([]);
    const [cuellos, setCuellos] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSimulacion() {
            try {
                const data = await obtenerSimulacion(rut, codigoCarrera, catalogo, token);
                setSimulacionAPI(data.simulacion);
                setCuellos(data.cuellos);
            } catch (err) {
                setError("No se pudo obtener la simulación");
            }
        }
        fetchSimulacion();
    }, [rut, codigoCarrera, catalogo, token]);

    const semestresSimulados = useMemo<Semestre[]>(() => {
        if (!simulacionAPI.length) return [];

        return simulacionAPI.map((semestreAPI, index) => {
            const etiquetaTemporal = calcularEtiquetaSimulacion(index);
            const asignaturasTransformadas: Asignatura[] = semestreAPI.cursos.map((curso: any): Asignatura => {
                return {
                    codigo: curso.codigo || `${curso.nombre}-${semestreAPI.numero}`,
                    asignatura: curso.nombre || curso.asignatura || 'Asignatura Desconocida',
                    creditos: curso.creditos,
                    nivel: semestreAPI.numero,
                    prereq: '',
                    estado: "simulado",
                };
            });

            return {
                nivel: etiquetaTemporal as any,
                asignaturas: asignaturasTransformadas,
            };
        });
    }, [simulacionAPI]);

    if (error) return <div className="error"> {error} </div>;
    if (!simulacionAPI.length) return <p>Cargando simulación...</p>;

    return (
        <div className="simulacion-container" >
            <h2>Simulación de Avance Curricular </h2>

            <MallaTimeline semestres={semestresSimulados} />
        </div>
    );
}

export default SimulacionView;
