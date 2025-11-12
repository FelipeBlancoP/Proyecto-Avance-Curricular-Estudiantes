import { useEffect, useState } from "react";
import { obtenerSimulacion } from "../../services/simulacionService";
import { Asignatura } from "../../types/malla";
import "./SimulacionView.css";

interface Props {
    rut: string;
    codigoCarrera: string;
    catalogo: string;
    token: string;
    malla: Asignatura[];
}

function SimulacionView({ rut, codigoCarrera, catalogo, token, malla }: Props) {
    const [simulacion, setSimulacion] = useState<any[]>([]);
    const [cuellos, setCuellos] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSimulacion() {
            try {
                const data = await obtenerSimulacion(rut, codigoCarrera, catalogo, token);
                setSimulacion(data.simulacion);
                setCuellos(data.cuellos);
            } catch (err) {
                setError("No se pudo obtener la simulación");
            }
        }
        fetchSimulacion();
    }, [rut, codigoCarrera, catalogo, token]);

    if (error) return <div className="error"> {error} </div>;
    if (!simulacion.length) return <p>Cargando simulación...</p>;

    return (
        <div className="simulacion-container" >
            <h2>Simulación de Avance Curricular </h2>

            {
                simulacion.map((semestre) => (
                    <div key={semestre.numero} className="semestre-card" >
                        <h3>Semestre {semestre.numero} </h3>
                        <ul>
                            {
                                semestre.cursos.map((curso: any) => (
                                    <li key={curso.codigo}>
                                        {curso.nombre || curso.asignatura || curso.codigo} — {curso.creditos} CR
                                    </li>
                                ))
                            }
                        </ul>

                        < p > <strong>Total Créditos: </strong> {semestre.creditos}</p >
                    </div>
                ))
            }

        </div>
    );
}

export default SimulacionView;
