import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Asignatura } from '../../types/malla';
import MallaManualService from '../../services/MallaManualService';
import SemestreManual from '../../components/SemestreManual/SemestreManual';
import CursosDisponibles from '../../components/CursosDisponibles/CursosDisponibles';
import './MallaManual.css';
import { estudianteService } from '../../services/estudianteService';

interface Semestre {
  id: number;
  cursos: Asignatura[];
  creditos: number;
}

function MallaManual() {
  const navigate = useNavigate();
  const [mallaCompleta, setMallaCompleta] = useState<Asignatura[]>([]);
  const [cursosDisponibles, setCursosDisponibles] = useState<Asignatura[]>([]);
  const [semestres, setSemestres] = useState<Semestre[]>([
    { id: 1, cursos: [], creditos: 0 },
    { id: 2, cursos: [], creditos: 0 },
    { id: 3, cursos: [], creditos: 0 },
    { id: 4, cursos: [], creditos: 0 },
    { id: 5, cursos: [], creditos: 0 },
    { id: 6, cursos: [], creditos: 0 },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulacionGuardada, setSimulacionGuardada] = useState(false);
  const dragItem = useRef<any>(null);
  // const dragOverItem = useRef<any>(null); // No se estaba usando

  // Datos de ejemplo

  useEffect(() => {
    const inicializarDatos = async () => {
      try {
        setLoading(true);
        console.log('=== 🚀 INICIANDO CARGA MALLA MANUAL ===');

        // 1. Obtener datos del estudiante logueado (RUT y Carreras)
        const perfil = await estudianteService.obtenerPerfil();
        
        if (!perfil || !perfil.carreras || perfil.carreras.length === 0) {
            throw new Error("No se encontraron datos de carrera para el estudiante.");
        }

        // 2. Extraer datos necesarios (Usamos la primera carrera por defecto)
        const { rut } = perfil;
        const carreraActual = perfil.carreras[0];
        const codigoCarrera = carreraActual.codigo;
        const catalogo = carreraActual.catalogo;

        console.log(`✅ Usuario autenticado: ${rut} - Carrera: ${codigoCarrera}`);

        // 3. Obtener la malla usando los datos dinámicos
        const malla = await MallaManualService.obtenerMalla(rut, codigoCarrera, catalogo);
        
        // 4. Filtrar cursos (Lógica original)
        const cursosPendientes = malla.filter(curso => {
          const estado = curso.estado?.toUpperCase() || '';
          const esAprobado = estado.includes('APROBADO');
          const esCursando = estado.includes('INSCRITO') ||
            estado.includes('CURSANDO') ||
            estado.includes('EN CURSO');
          return !esAprobado && !esCursando;
        });

        setMallaCompleta(malla);
        setCursosDisponibles(cursosPendientes);

        // 5. Cargar simulación guardada si existe (localStorage)
        const simulacionGuardada = MallaManualService.cargarSimulacion();
        if (simulacionGuardada) {
          console.log('💾 Simulación guardada cargada');
          setSemestres(simulacionGuardada);
          
          // Opcional: Si cargas una simulación, deberías quitar esos cursos de "disponibles"
          // para que no se dupliquen visualmente si el usuario refresca la página
          const codigosEnSimulacion = new Set();
          simulacionGuardada.forEach(s => s.cursos.forEach(c => codigosEnSimulacion.add(c.codigo)));
          
          setCursosDisponibles(prev => prev.filter(c => !codigosEnSimulacion.has(c.codigo)));
        }

        setError(null);
      } catch (err) {
        console.error('❌ Error al cargar datos:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(`Error: ${errorMessage}. ¿Has iniciado sesión?`);
        
        // Si falla por auth, redirigir al login después de un momento podría ser útil
        if(errorMessage.includes('token')) {
            navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    inicializarDatos();
  }, [navigate]);

  const handleDragStart = (e: React.DragEvent, curso: Asignatura, source: string, semestreId?: number) => {
    dragItem.current = { curso, source, semestreId };
    e.dataTransfer.setData('text/plain', JSON.stringify({ curso, source, semestreId }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetSemestreId: number) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { curso, source, semestreId: sourceSemestreId } = data;

    const validacionPrereq = MallaManualService.validarPrerrequisitos(
      curso,
      mallaCompleta,
      semestres,
      targetSemestreId
    );

    if (!validacionPrereq.valido) {
      alert(`🚫 No puedes tomar ${curso.asignatura}:\n\n${validacionPrereq.mensaje}`);
      return;
    }

    const cursosPendientesReales = mallaCompleta.filter(c => {
      const estado = c.estado?.toUpperCase() || '';
      return !estado.includes('APROBADO') && !estado.includes('INSCRITO') && !estado.includes('CURSANDO');
    });

    const cursosSimuladosAnteriormente = new Set<string>();
    semestres.forEach(s => {
      if (s.id < targetSemestreId) {
        s.cursos.forEach(c => cursosSimuladosAnteriormente.add(c.codigo));
      }
    });

    const deudaActualizada = cursosPendientesReales.filter(c =>
      !cursosSimuladosAnteriormente.has(c.codigo)
    );

    let nivelBaseAlumno = 1;
    if (deudaActualizada.length > 0) {
      nivelBaseAlumno = Math.min(...deudaActualizada.map(c => c.nivel));
    } else {
      nivelBaseAlumno = curso.nivel;
    }

    if ((curso.nivel - nivelBaseAlumno) > 2) {
      alert(
        `🚫 Bloqueo por Dispersión Académica:\n\n` +
        `Aunque has simulado algunos ramos, aún tienes asignaturas pendientes del Nivel ${nivelBaseAlumno}.\n` +
        `Por reglamento, no puedes tomar asignaturas del Nivel ${curso.nivel} ` +
        `(más de 2 semestres de diferencia con tu rezago actual).`
      );
      return;
    }

    // =================================================================
    // 3. VALIDACIÓN DE CRÉDITOS
    // =================================================================
    const esPractica = /práctica profesional/i.test(curso.asignatura);

    const semestreTarget = semestres.find(s => s.id === targetSemestreId);
    if (semestreTarget) {
      const creditosActuales = source === 'semestre' && sourceSemestreId === targetSemestreId
        ? semestreTarget.creditos - curso.creditos
        : semestreTarget.creditos;

      if (creditosActuales + curso.creditos > 30 && !esPractica) {
        alert('Límite de créditos excedido (máximo 30 por semestre)');
        return;
      }
    }

    // 4. LÓGICA DE MOVIMIENTO (Update State)
    if (source === 'disponibles') {
      setCursosDisponibles(prev => prev.filter(c => c.codigo !== curso.codigo));
      setSemestres(prev => prev.map(semestre => {
        if (semestre.id === targetSemestreId) {
          return {
            ...semestre,
            cursos: [...semestre.cursos, curso],
            creditos: esPractica? semestre.creditos : semestre.creditos + curso.creditos
          };
        }
        return semestre;
      }));
    } else if (source === 'semestre') {
      if (sourceSemestreId === targetSemestreId) return;
      setSemestres(prev => prev.map(semestre => {
        if (semestre.id === sourceSemestreId) {
          return {
            ...semestre,
            cursos: semestre.cursos.filter(c => c.codigo !== curso.codigo),
            creditos: esPractica? semestre.creditos : semestre.creditos - curso.creditos
          };
        }
        if (semestre.id === targetSemestreId) {
          return {
            ...semestre,
            cursos: [...semestre.cursos, curso],
            creditos: esPractica? semestre.creditos : semestre.creditos + curso.creditos
          };
        }
        return semestre;
      }));
    }
  };

  const handleDropDisponibles = (e: React.DragEvent) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { curso, source, semestreId: sourceSemestreId } = data;

    if (source === 'semestre') {
      setSemestres(prev => prev.map(semestre => {
        if (semestre.id === sourceSemestreId) {
          return {
            ...semestre,
            cursos: semestre.cursos.filter(c => c.codigo !== curso.codigo),
            creditos: semestre.creditos - curso.creditos
          };
        }
        return semestre;
      }));
      setCursosDisponibles(prev => [...prev, curso]);
    }
  };

  const agregarSemestre = () => {
    const nuevoId = semestres.length > 0 ? Math.max(...semestres.map(s => s.id)) + 1 : 1;
    setSemestres(prev => [...prev, { id: nuevoId, cursos: [], creditos: 0 }]);
  };

  const eliminarSemestre = (id: number) => {
    if (semestres.length <= 1) {
      alert('Debe haber al menos un semestre');
      return;
    }

    const semestreAEliminar = semestres.find(s => s.id === id);
    if (semestreAEliminar) {
      setCursosDisponibles(prev => [...prev, ...semestreAEliminar.cursos]);
    }

    setSemestres(prev => {
      const semestresRestantes = prev.filter(s => s.id !== id);
      return semestresRestantes.map((semestre, index) => ({
        ...semestre,
        id: index + 1
      }));
    });
  };

  const guardarSimulacion = () => {
    MallaManualService.guardarSimulacion(semestres);
    setSimulacionGuardada(true);
    setTimeout(() => setSimulacionGuardada(false), 3000);
  };

  const reiniciarSimulacion = () => {
    if (window.confirm('¿Estás seguro de reiniciar toda la simulación?')) {
      // Recalcular disponibles basándose en la mallaCompleta original
      const disponibles = mallaCompleta.filter(curso => {
        const estado = curso.estado?.toUpperCase() || '';
        const esAprobado = estado.includes('APROBADO');
        const esCursando = estado.includes('INSCRITO') ||
          estado.includes('CURSANDO') ||
          estado.includes('EN CURSO');
        return !esAprobado && !esCursando;
      });

      setCursosDisponibles(disponibles);
      setSemestres([
        { id: 1, cursos: [], creditos: 0 },
        { id: 2, cursos: [], creditos: 0 },
        { id: 3, cursos: [], creditos: 0 },
        { id: 4, cursos: [], creditos: 0 },
        { id: 5, cursos: [], creditos: 0 },
        { id: 6, cursos: [], creditos: 0 },
      ]);
      MallaManualService.eliminarSimulacion();
    }
  };

  const totalCreditos = semestres.reduce((total, semestre) => total + semestre.creditos, 0);
  const cursosAsignados = semestres.reduce((total, semestre) => total + semestre.cursos.length, 0);

  if (loading) return <div className="loading">Cargando malla...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="malla-manual-container">
      <div className="malla-manual-top-bar">
        <div className="header-left-group">
          <button onClick={() => navigate('/')} className="back-btn">
            🡰
          </button>
          <h1>Simulación Manual de Malla</h1>
        </div>
      </div>

      {simulacionGuardada && (
        <div className="success-message">
          ✅ Simulación guardada exitosamente
        </div>
      )}

      <div className="content-wrapper">
        <div className="estado-info">
          <h3>📊 Estado Actual del Estudiante</h3>
          <div className="estado-stats">
            <div className="estado-stat aprobado">
              <span className="estado-label">Aprobados:</span>
              <span className="estado-value">
                {mallaCompleta.filter(c => c.estado?.toUpperCase().includes('APROBADO')).length}
              </span>
            </div>
            <div className="estado-stat reprobado">
              <span className="estado-label">Reprobados:</span>
              <span className="estado-value">
                {mallaCompleta.filter(c => c.estado?.toUpperCase().includes('REPROBADO')).length}
              </span>
            </div>
            <div className="estado-stat cursando">
              <span className="estado-label">Cursando:</span>
              <span className="estado-value">
                {mallaCompleta.filter(c => {
                  const estado = c.estado?.toUpperCase() || '';
                  return estado.includes('INSCRITO') || estado.includes('CURSANDO');
                }).length}
              </span>
            </div>
            <div className="estado-stat pendiente">
              <span className="estado-label">Pendientes:</span>
              <span className="estado-value">{cursosDisponibles.length}</span>
            </div>
          </div>
          <p className="estado-nota">
            <strong>Nota:</strong> Solo los cursos "Pendientes" están disponibles para simulación manual.
            Los cursos "Aprobados" y "Cursando" no aparecen en la lista.
          </p>
        </div>

        <div className="instructions">
          <h3>📋 Instrucciones:</h3>
          <ul>
            <li>Arrastra cursos desde "Cursos Disponibles" hacia los semestres</li>
            <li>Mueve cursos entre semestres arrastrándolos</li>
            <li>Devuelve cursos arrastrándolos de vuelta a "Cursos Disponibles"</li>
            <li>Límite: 30 créditos por semestre</li>
            <li>Se validan automáticamente los prerrequisitos</li>
          </ul>
        </div>

        <div className="main-content">
          <div className="cursos-section">
            <div className="cursos-header-row">
              <div className="cursos-header-left">
                <h2>Cursos Disponibles</h2>
                <p className="section-subtitle">Arrastra cursos a los semestres</p>
              </div>
              <div className="stats-bar">
                <div className="stat">
                  <span className="stat-label">Asignados:</span>
                  <span className="stat-value">{cursosAsignados}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Créditos:</span>
                  <span className="stat-value">{totalCreditos}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Semestres:</span>
                  <span className="stat-value">{semestres.length}</span>
                </div>
              </div>
            </div>
            <div
              className="cursos-disponibles-container"
              onDragOver={handleDragOver}
              onDrop={handleDropDisponibles}
            >
              <CursosDisponibles
                cursos={cursosDisponibles}
                onDragStart={(e, curso) => handleDragStart(e, curso, 'disponibles')}
              />
            </div>
          </div>

          <div className="semestres-section">
            <div className="semestres-header">
              <h2>Semestres Simulados</h2>
              <button onClick={agregarSemestre} className="add-semestre-btn">
                + Agregar Semestre
              </button>
            </div>

            <div className="semestres-grid">
              {semestres.map((semestre) => (
                <SemestreManual
                  key={semestre.id}
                  semestre={semestre}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, semestre.id)}
                  onDragStart={(e, curso) => handleDragStart(e, curso, 'semestre', semestre.id)}
                  onEliminarSemestre={() => eliminarSemestre(semestre.id)}
                />
              ))}
            </div>

            <div className="header-actions">
              <button onClick={guardarSimulacion} className="save-btn">
                Guardar Simulación
              </button>
              <button onClick={reiniciarSimulacion} className="reset-btn">
                Reiniciar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MallaManual;