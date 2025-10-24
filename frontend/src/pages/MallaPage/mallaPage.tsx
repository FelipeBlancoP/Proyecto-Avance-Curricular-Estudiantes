// src/pages/MallaPage.tsx

import { useEffect, useState, useMemo } from "react";
import * as mallaService from "../../services/mallaService";
import { Malla, Asignatura } from "../../types/malla";
import MallaTimeline from "../../components/MallaTimeline/MallaTimeline"; // Importamos el nuevo componente

// Definimos el tipo para la data agrupada
export interface Semestre {
  nivel: number;
  asignaturas: Asignatura[];
}

function MallaPage() {
  const [malla, setMalla] = useState<Malla | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // AQUÍ ESTÁ LA MAGIA: Agrupamos la malla por nivel
  const semestresAgrupados = useMemo<Semestre[]>(() => {
    if (!malla) return [];

    // 1. Usamos reduce para agrupar en un objeto (Record)
    const agrupadoPorNivel = malla.reduce((acc, asignatura) => {
      const nivel = asignatura.nivel;
      if (!acc[nivel]) {
        acc[nivel] = [];
      }
      acc[nivel].push(asignatura);
      return acc;
    }, {} as Record<number, Asignatura[]>);

    // 2. Convertimos el objeto a un array ordenado por nivel
    return Object.keys(agrupadoPorNivel)
      .map(Number)
      .sort((a, b) => a - b)
      .map((nivel) => ({
        nivel: nivel,
        asignaturas: agrupadoPorNivel[nivel],
      }));
  }, [malla]); // Esta función solo se re-ejecuta si 'malla' cambia

  if (isLoading) {
    return <div>Cargando malla...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Mi malla</h1>
      {/* Pasamos la data agrupada al nuevo componente */}
      {semestresAgrupados.length > 0 ? (
        <MallaTimeline semestres={semestresAgrupados} />
      ) : (
        <div>No hay asignaturas para mostrar.</div>
      )}
    </div>
  );
}

export default MallaPage;