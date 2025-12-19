import { useEffect, useState, useMemo } from "react";
import * as mallaService from "../../services/mallaService";
import { Malla, Asignatura } from "../../types/malla";
import MallaTimeline from "../../components/MallaTimeline/MallaTimeline";
import SimulacionView from "../../components/SimulacionView/SimulacionView";
import { useNavigate } from 'react-router-dom';
import "./MallaPage.css";
import { Estudiante } from "../../types/estudiante";
import { estudianteService } from "../../services/estudianteService";
import ThemeToggle from '../../components/TemaToggle/TemaToggle';

export interface Semestre {
  nivel: number;
  asignaturas: Asignatura[];
  totalCreditos?: number;
}

function MallaPage() {
  const navigate = useNavigate();
  const [estudiante, setEstudiante] = useState<Estudiante | null>(null);
  const [malla, setMalla] = useState<Malla | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarMallaTimeline, setMostrarMallaTimeline] = useState(false);
  const [mostrarSimulacion, setMostrarSimulacion] = useState(true);

  useEffect(() => {
    const cargarDatosEstudiante = async () => {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const perfil = await estudianteService.obtenerPerfil();
        setEstudiante(perfil);
      } catch (err) {
        console.error("Error cargando perfil:", err);
        setError("No se pudieron cargar los datos del estudiante.");
        setIsLoading(false);
      }
    };

    cargarDatosEstudiante();
  }, [navigate]);


  useEffect(() => {
    const fetchMalla = async () => {
      if (!estudiante) return;

      if (!estudiante.carreras || estudiante.carreras.length === 0) {
        setError("El estudiante no tiene carreras asociadas.");
        setIsLoading(false);
        return;
      }

      const carreraActual = estudiante.carreras[0];

      try {
        setIsLoading(true);
        const data = await mallaService.obtenerMalla(
          estudiante.rut,
          carreraActual.codigo,
          carreraActual.catalogo
        );
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
  }, [estudiante]);


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
  if (!estudiante) return null;

  const carreraActual = estudiante.carreras[0];
  const nombreCarreraAbr = carreraActual ? carreraActual.nombre : "Carrera no encontrada";

  let nombreCarrera = ""
  if (nombreCarreraAbr === "ICCI") nombreCarrera = "Ingeniería Civil en Computación e Informática"
  if (nombreCarreraAbr === "ICI") nombreCarrera = "Ingeniería Civil Industrial"
  if (nombreCarreraAbr === "ITI") nombreCarrera = "Ingeniería en Tecnologías de Información"

  const token = localStorage.getItem("token") || localStorage.getItem("access_token") || "";

  return (
    <div className="page-layout-container">
      <main className="malla-page-container">
        <button onClick={() => navigate('/')} className="back-btn">
          🡰
        </button>

        <h1 className="main-title">Simulación de Avance Curricular</h1>
        <ThemeToggle />

        <div className="career-box">{nombreCarrera}</div>
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
            rut={estudiante.rut}
            codigoCarrera={carreraActual.codigo}
            catalogo={carreraActual.catalogo}
            token={token}
            malla={malla}
          />
        )}
      </main>
    </div>
  );
}

export default MallaPage;
