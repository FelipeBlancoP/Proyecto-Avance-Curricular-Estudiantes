import { useEffect, useState, useMemo } from "react";
import * as mallaService from "../../services/mallaService";
import { Malla, Asignatura } from "../../types/malla";
import MallaTimeline from "../../components/MallaTimeline/MallaTimeline";
import SimulacionView from "../../components/SimulacionView/SimulacionView";
import "./MallaPage.css";

export interface Semestre {
  nivel: number;
  asignaturas: Asignatura[];
}

function MallaPage() {
  const [malla, setMalla] = useState<Malla | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarMallaTimeline, setMostrarMallaTimeline] = useState(false);


  const [mostrarSimulacion, setMostrarSimulacion] = useState(true);

  const nombreCarrera = "Ingeniería en Tecnologías de Información";
  const rut = "333333333";
  const codigoCarrera = "8266";
  const catalogo = "202410";
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    const fetchMalla = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await mallaService.obtenerMalla(rut, codigoCarrera, catalogo);
        setMalla(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("No se pudo cargar la malla");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchMalla();
  }, []);


  const semestresAgrupados = useMemo<Semestre[]>((() => {
    if (!malla) return [];

    const agrupadoPorNivel = malla.reduce((acc, asignatura) => {
      const nivel = asignatura.nivel;
      if (!acc[nivel]) acc[nivel] = [];
      acc[nivel].push(asignatura);
      return acc;
    }, {} as Record<number, Asignatura[]>);

    return Object.keys(agrupadoPorNivel)
      .map(Number)
      .sort((a, b) => a - b)
      .map((nivel) => ({
        nivel,
        asignaturas: agrupadoPorNivel[nivel],
      }));
  }), [malla]);

  const handleToggleMenu = () => {
    console.log("Abrir/Cerrar menú lateral");
  };

  if (isLoading) return <div>Cargando malla...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="page-layout-container">
      <main className="malla-page-container">
        <button className="menu-button" onClick={handleToggleMenu}>
          <span className="menu-line"></span>
          <span className="menu-line"></span>
          <span className="menu-line"></span>
        </button>

        <h1 className="main-title">Simulación de Avance Curricular</h1>

        <div className="career-box">{nombreCarrera}</div>
        {/* BOTÓN DE MOSTRAR SIMULACIÓN Y OCULTAR */}
        {/* <div style={{ marginBottom: "1rem" }}>
          <button
            className="simulacion-btn"
            onClick={() => setMostrarSimulacion(!mostrarSimulacion)}
          >
            {mostrarSimulacion ? "Ocultar simulación" : "Simular avance curricular"}
          </button>
        </div> */}

        <button
          className="desplegable-malla-btn"
          onClick={() => setMostrarMallaTimeline(!mostrarMallaTimeline)}
        >
          {mostrarMallaTimeline ? "Ocultar Malla Curricular Actual ▲" : "Ver Malla Curricular Actual ▼"}
        </button>

        {mostrarMallaTimeline && (
          <div className="timeline-container-animado">
            {semestresAgrupados.length > 0 ? (
              <MallaTimeline semestres={semestresAgrupados} />
            ) : (
              <div>No hay asignaturas para mostrar.</div>
            )}
          </div>
        )}

        {mostrarSimulacion && malla && (
          <SimulacionView
            rut={rut}
            codigoCarrera={codigoCarrera}
            catalogo={catalogo}
            token={token}
            malla={malla}
          />
        )}
      </main>
    </div>
  );
}

export default MallaPage;
