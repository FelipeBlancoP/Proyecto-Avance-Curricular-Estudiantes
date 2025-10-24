// src/pages/MallaPage.tsx

import { useEffect, useState, useMemo } from "react";
import * as mallaService from "../../services/mallaService";
import { Malla, Asignatura } from "../../types/malla";
import MallaTimeline from "../../components/MallaTimeline/MallaTimeline";
import "./MallaPage.css"; // ¡NUEVO! Importamos el CSS para MallaPage

// Definimos el tipo para la data agrupada
export interface Semestre {
  nivel: number;
  asignaturas: Asignatura[];
}

function MallaPage() {
  const [malla, setMalla] = useState<Malla | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- NUEVO: Nombre de la carrera harcodeado ---
  const nombreCarrera = "Ingeniería Civil en Computación e Informática";
  // ----------------------------------------------

  useEffect(() => {
    const fetchMalla = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await mallaService.obtenerMalla("8266", "202410");
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

  const semestresAgrupados = useMemo<Semestre[]>(() => {
    if (!malla) return [];

    const agrupadoPorNivel = malla.reduce((acc, asignatura) => {
      const nivel = asignatura.nivel;
      if (!acc[nivel]) {
        acc[nivel] = [];
      }
      acc[nivel].push(asignatura);
      return acc;
    }, {} as Record<number, Asignatura[]>);

    return Object.keys(agrupadoPorNivel)
      .map(Number)
      .sort((a, b) => a - b)
      .map((nivel) => ({
        nivel: nivel,
        asignaturas: agrupadoPorNivel[nivel],
      }));
  }, [malla]);

  const handleToggleMenu = () => {
    console.log("Abrir/Cerrar menú lateral");
    // Aquí irá la lógica para mostrar el menú
  };

  if (isLoading) {
    return <div>Cargando malla...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    
    // Agregamos una clase al contenedor principal
    <div className="malla-page-container">

      <button className="menu-button" onClick={handleToggleMenu}>
        <span className="menu-line"></span>
        <span className="menu-line"></span>
        <span className="menu-line"></span>
      </button>
      {/* 1. Título con el nuevo estilo */}
      <h1 className="main-title">Mi malla</h1>

      {/* 2. Cuadro con el nombre de la carrera */}
      <div className="career-box">
        {nombreCarrera}
      </div>

      {/* El resto de la malla */}
      {semestresAgrupados.length > 0 ? (
        <MallaTimeline semestres={semestresAgrupados} />
      ) : (
        <div>No hay asignaturas para mostrar.</div>
      )}
    </div>
  );
}

export default MallaPage;