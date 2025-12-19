import { Asignatura, Malla } from '../types/malla';

interface Semestre {
  id: number;
  cursos: Asignatura[];
  creditos: number;
}

export const MallaManualService = {
  async obtenerMalla(rut: string, codigoCarrera: string, catalogo: string): Promise<Malla> {
    try {
      // Aunque el endpoint sea "sin auth" (público), validamos que exista sesión en el front
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      console.log(`🔍 Obteniendo malla para RUT: ${rut}, Carrera: ${codigoCarrera}`);

      // CAMBIO: Usamos el endpoint que recibe parámetros por Query String
      const response = await fetch(
        `http://localhost:3000/malla/mi-malla-con-estado?rut=${rut}&codigoCarrera=${codigoCarrera}&catalogo=${catalogo}`,
        {
          headers: {
            // Mantenemos el header Auth por si decides proteger el endpoint en el futuro
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Error al obtener malla: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Malla obtenida correctamente:', data.length, 'cursos');
      return data;

    } catch (error) {
      console.error('❌ Error:', error);
      throw error;
    }
  },

  // En MallaManualService.ts

  // 1. Fíjate que el tipo de retorno ahora es un Objeto, no un boolean
  validarPrerrequisitos(
    curso: Asignatura,
    mallaCompleta: Asignatura[],
    semestres: Semestre[],
    semestreTargetId: number
  ): { valido: boolean; mensaje?: string } {  // <--- CAMBIO IMPORTANTE AQUÍ

    if (!curso.prereq || curso.prereq.length === 0) return { valido: true };

    // Convertir prereq a array si es string
    const prerequisitos = typeof curso.prereq === 'string'
      ? curso.prereq.split(',').map(p => p.trim()).filter(p => p.length > 0)
      : curso.prereq;

    if (prerequisitos.length === 0) return { valido: true };

    // Iteramos sobre los requisitos
    for (const prereqCodigo of prerequisitos) {
      let cumplido = false;

      // A. Buscar en la malla histórica (lo que ya traes del backend)
      const prereqCurso = mallaCompleta.find(c => c.codigo === prereqCodigo);

      if (prereqCurso) {
        const estado = prereqCurso.estado?.toLowerCase();
        // Aquí está la lógica que permite "Cursando"
        if (estado === 'aprobado' || estado === 'cursando' || estado === 'inscrito') {
          cumplido = true;
        }
      } else {
        // Si no existe en la malla (ej: electivo fantasma), asumimos cumplido para no bloquear
        cumplido = true;
      }

      // B. Si no está cumplido por historia, buscamos en la simulación actual
      if (!cumplido) {
        const semestreConPrereq = semestres.find(s =>
          s.cursos.some(c => c.codigo === prereqCodigo)
        );

        if (semestreConPrereq) {
          if (semestreConPrereq.id < semestreTargetId) {
            cumplido = true;
          } else if (semestreConPrereq.id === semestreTargetId) {
            const nombre = prereqCurso?.asignatura || prereqCodigo;
            return {
              valido: false,
              mensaje: `El prerrequisito ${nombre} (${prereqCodigo}) está en este mismo semestre (correquisito no permitido).`
            };
          } else {
            const nombre = prereqCurso?.asignatura || prereqCodigo;
            return {
              valido: false,
              mensaje: `El prerrequisito ${nombre} (${prereqCodigo}) está planificado para un futuro posterior.`
            };
          }
        }
      }

      // C. Si falló todo lo anterior, devolvemos el error
      if (!cumplido) {
        const nombre = prereqCurso?.asignatura || prereqCodigo;
        return {
          valido: false,
          mensaje: `Falta prerrequisito: ${nombre} (${prereqCodigo}).`
        };
      }
    }

    // Si pasa todo el loop, es válido
    return { valido: true };
  },

  async guardarSimulacion(nombre: string, semestres: Semestre[]): Promise<void> {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) throw new Error('No estás autenticado');

      // 1. Transformar datos al formato del DTO del Backend (CreateSimulacionDto)
      const payload = {
        nombre: nombre,
        semestres: semestres.map(s => ({
          id: s.id,
          cursos: s.cursos.map(c => ({ codigo: c.codigo })) // Solo mandamos el código
        }))
      };

      // 2. Enviar al Endpoint
      const response = await fetch('http://localhost:3000/simulacion/guardar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar simulación');
      }

      console.log('✅ Simulación guardada en Base de Datos');

    } catch (error) {
      console.error('Error al guardar simulación:', error);
      throw error; // Re-lanzamos para que el componente muestre el error
    }
  },

  cargarSimulacion(): Semestre[] | null {
    try {
      const simulacionGuardada = localStorage.getItem('malla-manual-simulacion');
      if (simulacionGuardada) {
        return JSON.parse(simulacionGuardada);
      }
      return null;
    } catch (error) {
      console.error('Error al cargar simulación:', error);
      return null;
    }
  },

  eliminarSimulacion(): void {
    try {
      localStorage.removeItem('malla-manual-simulacion');
      console.log('Simulación eliminada');
    } catch (error) {
      console.error('Error al eliminar simulación:', error);
    }
  },

  // Generar estadísticas de la simulación
  generarEstadisticas(semestres: Semestre[]): {
    totalCreditos: number;
    totalCursos: number;
    semestresUtilizados: number;
    creditosPromedio: number;
  } {
    const totalCreditos = semestres.reduce((total, semestre) => total + semestre.creditos, 0);
    const totalCursos = semestres.reduce((total, semestre) => total + semestre.cursos.length, 0);
    const semestresUtilizados = semestres.filter(s => s.cursos.length > 0).length;
    const creditosPromedio = semestresUtilizados > 0 ? totalCreditos / semestresUtilizados : 0;

    return {
      totalCreditos,
      totalCursos,
      semestresUtilizados,
      creditosPromedio: Math.round(creditosPromedio * 100) / 100
    };
  },

  obtenerMallaEjemplo(): Asignatura[] {
    // Datos de ejemplo para desarrollo - algunos aprobados, otros no
    return [
      {
        codigo: "DCCB-00107",
        asignatura: "Álgebra I",
        creditos: 6,
        nivel: 1,
        prereq: "", // ← Cambia [] por "" (string vacío)
        estado: "APROBADO"
      },
      {
        codigo: "DCCB-00106",
        asignatura: "Cálculo I",
        creditos: 6,
        nivel: 1,
        prereq: "", // ← Cambia [] por ""
        estado: "APROBADO"
      },
      {
        codigo: "ECIN-00704",
        asignatura: "Programación I",
        creditos: 6,
        nivel: 1,
        prereq: "", // ← Cambia [] por ""
        estado: "APROBADO"
      },
      {
        codigo: "DCCB-00108",
        asignatura: "Álgebra II",
        creditos: 6,
        nivel: 2,
        prereq: "DCCB-00107", // ← Cambia ["DCCB-00107"] por "DCCB-00107"
        estado: "APROBADO"
      },
      {
        codigo: "DCCB-00109",
        asignatura: "Cálculo II",
        creditos: 6,
        nivel: 2,
        prereq: "DCCB-00106", // ← Cambia ["DCCB-00106"] por "DCCB-00106"
        estado: "REPROBADO"
      },
      {
        codigo: "ECIN-00600",
        asignatura: "Programación II",
        creditos: 6,
        nivel: 2,
        prereq: "ECIN-00704", // ← Cambia ["ECIN-00704"] por "ECIN-00704"
        estado: "No cursado"
      },
      {
        codigo: "DCCB-00110",
        asignatura: "Cálculo III",
        creditos: 6,
        nivel: 3,
        prereq: "DCCB-00109", // ← Cambia ["DCCB-00109"] por "DCCB-00109"
        estado: "No cursado"
      },
      {
        codigo: "ECIN-00601",
        asignatura: "Programación III",
        creditos: 6,
        nivel: 3,
        prereq: "ECIN-00600", // ← Cambia ["ECIN-00600"] por "ECIN-00600"
        estado: "No cursado"
      }
    ];
  }
};

export default MallaManualService;