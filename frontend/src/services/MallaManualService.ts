import { Asignatura } from '../types/malla';

interface Semestre {
  id: number;
  cursos: Asignatura[];
  creditos: number;
}

export const MallaManualService = {
  async obtenerMalla(codigoCarrera: string, catalogo: string): Promise<Asignatura[]> {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token'); // Asegura obtener el token correcto
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      console.log('🔍 Obteniendo malla autenticada para manual...');
      
      // CAMBIO: Llamamos al nuevo endpoint 'mi-malla-con-estado-auth'
      // Ya NO enviamos el RUT en la URL, el backend lo saca del token
      const response = await fetch(
        `http://localhost:3000/malla/mi-malla-con-estado-auth?codigoCarrera=${codigoCarrera}&catalogo=${catalogo}`,
        {
          headers: {
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

  validarPrerrequisitos(
    curso: Asignatura,
    mallaCompleta: Asignatura[],
    semestres: Semestre[],
    semestreTargetId: number
  ): boolean {
    if (!curso.prereq || curso.prereq.length === 0) return true;

    // Convertir prereq a array si es string
    const prerequisitos = typeof curso.prereq === 'string' 
      ? curso.prereq.split(',').map(p => p.trim()).filter(p => p.length > 0)
      : curso.prereq;

    if (prerequisitos.length === 0) return true;

    // Encontrar en qué semestres están los prerrequisitos
    const prerequisitosCumplidos = prerequisitos.every(prereqCodigo => {
      // Buscar si el prerrequisito está en la malla
      const prereqCurso = mallaCompleta.find(c => c.codigo === prereqCodigo);
      if (!prereqCurso) return true; // Si no existe en la malla, asumimos cumplido

      // Verificar si el curso está aprobado
      if (prereqCurso.estado?.toLowerCase() === 'aprobado') return true;

      // Verificar si está en algún semestre anterior al target
      let prereqEnSemestreAnterior = false;
      for (const semestre of semestres) {
        if (semestre.id < semestreTargetId) {
          const encontrado = semestre.cursos.find(c => c.codigo === prereqCodigo);
          if (encontrado) {
            prereqEnSemestreAnterior = true;
            break;
          }
        }
      }
      return prereqEnSemestreAnterior;
    });

    return prerequisitosCumplidos;
  },

  guardarSimulacion(semestres: Semestre[]): void {
    try {
      localStorage.setItem('malla-manual-simulacion', JSON.stringify(semestres));
      console.log('Simulación guardada en localStorage');
    } catch (error) {
      console.error('Error al guardar simulación:', error);
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