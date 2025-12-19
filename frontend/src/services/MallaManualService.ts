import { Asignatura, Malla } from '../types/malla';

interface Semestre {
  id: number;
  cursos: Asignatura[];
  creditos: number;
}

interface SimulacionHeader {
  id: number;
  nombre: string;
  fechaCreacion: string;
}

export const MallaManualService = {
  async obtenerMalla(rut: string, codigoCarrera: string, catalogo: string): Promise<Malla> {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      console.log(`🔍 Obteniendo malla para RUT: ${rut}, Carrera: ${codigoCarrera}`);
      const response = await fetch(
        `http://localhost:3000/malla/mi-malla-con-estado?rut=${rut}&codigoCarrera=${codigoCarrera}&catalogo=${catalogo}`,
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
  ): { valido: boolean; mensaje?: string } { 

    if (!curso.prereq || curso.prereq.length === 0) return { valido: true };

    const prerequisitos = typeof curso.prereq === 'string'
      ? curso.prereq.split(',').map(p => p.trim()).filter(p => p.length > 0)
      : curso.prereq;

    if (prerequisitos.length === 0) return { valido: true };

    for (const prereqCodigo of prerequisitos) {
      let cumplido = false;
      const prereqCurso = mallaCompleta.find(c => c.codigo === prereqCodigo);

      if (prereqCurso) {
        const estado = prereqCurso.estado?.toLowerCase();
        if (estado === 'aprobado' || estado === 'cursando' || estado === 'inscrito') {
          cumplido = true;
        }
      } else {
        cumplido = true;
      }
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

      if (!cumplido) {
        const nombre = prereqCurso?.asignatura || prereqCodigo;
        return {
          valido: false,
          mensaje: `Falta prerrequisito: ${nombre} (${prereqCodigo}).`
        };
      }
    }

    return { valido: true };
  },

  async guardarSimulacion(nombre: string, semestres: Semestre[]): Promise<void> {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) throw new Error('No estás autenticado');

      const payload = {
        nombre: nombre,
        semestres: semestres.map(s => ({
          id: s.id,
          cursos: s.cursos.map(c => ({ codigo: c.codigo }))
        }))
      };

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
      throw error;
    }
  },

  async obtenerMisSimulaciones(): Promise<SimulacionHeader[]> {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) throw new Error('No estás autenticado');

      const response = await fetch('http://localhost:3000/simulacion/mis-guardadas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Error al obtener lista de simulaciones');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  async cargarSimulacion(id: number): Promise<{ nombre: string, semestres: any[] } | null> {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) throw new Error('No estás autenticado');

      const response = await fetch(`http://localhost:3000/simulacion/cargar/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Error al cargar detalle de simulación');
      
      const data = await response.json();
      
      const semestresFormateados = data.simulacion.map((sem: any) => ({
         nivel: sem.numero,
         totalCreditos: sem.creditos,
         asignaturas: sem.cursos.map((c: any) => ({
            ...c,
            asignatura: c.nombre,
         }))
      }));

      return {
        nombre: data.nombre,
        semestres: semestresFormateados
      };

    } catch (error) {
      console.error(error);
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
    return [
      {
        codigo: "DCCB-00107",
        asignatura: "Álgebra I",
        creditos: 6,
        nivel: 1,
        prereq: "",
        estado: "APROBADO"
      },
      {
        codigo: "DCCB-00106",
        asignatura: "Cálculo I",
        creditos: 6,
        nivel: 1,
        prereq: "",
        estado: "APROBADO"
      },
      {
        codigo: "ECIN-00704",
        asignatura: "Programación I",
        creditos: 6,
        nivel: 1,
        prereq: "",
        estado: "APROBADO"
      },
      {
        codigo: "DCCB-00108",
        asignatura: "Álgebra II",
        creditos: 6,
        nivel: 2,
        prereq: "DCCB-00107", 
        estado: "APROBADO"
      },
      {
        codigo: "DCCB-00109",
        asignatura: "Cálculo II",
        creditos: 6,
        nivel: 2,
        prereq: "DCCB-00106",
        estado: "REPROBADO"
      },
      {
        codigo: "ECIN-00600",
        asignatura: "Programación II",
        creditos: 6,
        nivel: 2,
        prereq: "ECIN-00704", 
        estado: "No cursado"
      },
      {
        codigo: "DCCB-00110",
        asignatura: "Cálculo III",
        creditos: 6,
        nivel: 3,
        prereq: "DCCB-00109",
        estado: "No cursado"
      },
      {
        codigo: "ECIN-00601",
        asignatura: "Programación III",
        creditos: 6,
        nivel: 3,
        prereq: "ECIN-00600", 
        estado: "No cursado"
      }
    ];
  }
};

export default MallaManualService;