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

        return simulacionAPI.map(semestreAPI => {
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
                nivel: semestreAPI.numero,
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
