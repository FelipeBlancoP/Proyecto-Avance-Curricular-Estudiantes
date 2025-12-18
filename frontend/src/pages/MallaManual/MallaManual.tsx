import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Asignatura } from '../../types/malla';
import MallaManualService from '../../services/MallaManualService';
import SemestreManual from '../../components/SemestreManual/SemestreManual';
import CursosDisponibles from '../../components/CursosDisponibles/CursosDisponibles';
import './MallaManual.css';

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
  const dragOverItem = useRef<any>(null);

  // Datos de ejemplo - deberían venir del backend o localStorage
  const codigoCarrera = '8266';
  const catalogo = '202410';

  // En el useEffect, actualiza completamente:
  useEffect(() => {
    const cargarMalla = async () => {
      try {
        setLoading(true);
        console.log('=== 🚀 INICIANDO CARGA MALLA MANUAL ===');

        const malla = await MallaManualService.obtenerMalla(codigoCarrera, catalogo);
        console.log('✅ Datos recibidos para el usuario autenticado');

        // DEBUG DETALLADO
        console.log('=== 📊 ESTADOS DE CURSOS ===');
        const estadosUnicos = new Set<string>();
        malla.forEach((curso, index) => {
          estadosUnicos.add(curso.estado || 'SIN-ESTADO');
          console.log(`${index + 1}. ${curso.codigo} - ${curso.asignatura}`);
          console.log(`   Estado: "${curso.estado}"`);
          console.log(`   Estado (uppercase): "${curso.estado?.toUpperCase()}"`);
          console.log(`   Incluye "APROBADO": ${curso.estado?.toUpperCase().includes('APROBADO')}`);
          console.log(`   ---`);
        });

        console.log('=== 🎯 ESTADOS ÚNICOS ENCONTRADOS ===');
        console.log(Array.from(estadosUnicos));

        // FILTRO MÁS AGRESIVO - DEBUG
        const cursosPendientes = malla.filter(curso => {
          const estado = curso.estado?.toUpperCase() || '';
          const esAprobado = estado.includes('APROBADO');
          const esCursando = estado.includes('INSCRITO') ||
            estado.includes('CURSANDO') ||
            estado.includes('EN CURSO');
          return !esAprobado && !esCursando;
        });

        console.log('=== 📈 RESULTADO FILTRADO ===');
        console.log(`Total: ${malla.length}`);
        console.log(`Aprobados: ${malla.filter(c => c.estado?.toUpperCase().includes('APROBADO')).length}`);
        console.log(`Pendientes (mostrar): ${cursosPendientes.length}`);
        console.log('Cursos pendientes:');
        cursosPendientes.forEach(curso => {
          console.log(`- ${curso.codigo}: ${curso.estado}`);
        });

        setMallaCompleta(malla);
        setCursosDisponibles(cursosPendientes);

        // Cargar simulación guardada si existe
        const simulacionGuardada = MallaManualService.cargarSimulacion();
        if (simulacionGuardada) {
          console.log('💾 Simulación guardada cargada');
          setSemestres(simulacionGuardada);
        }

        setError(null);
      } catch (err) {
        console.error('❌ Error al cargar malla:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar la malla';
        setError(`Error: ${errorMessage}. Verifica la consola.`);

        // SOLO para desarrollo/debug - usar datos de ejemplo
        console.log('⚠️ Usando datos de ejemplo para desarrollo');
        const mallaEjemplo = [
          {
            codigo: "DCCB-00107",
            asignatura: "Álgebra I",
            creditos: 6,
            nivel: 1,
            prereq: "",
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
          }
        ];

        const cursosPendientesEjemplo = mallaEjemplo.filter(curso => {
          const estado = curso.estado?.toUpperCase() || '';
          return !estado.includes('APROBADO');
        });

        setMallaCompleta(mallaEjemplo);
        setCursosDisponibles(cursosPendientesEjemplo);
      } finally {
        setLoading(false);
      }
    };

    cargarMalla();
  }, [codigoCarrera, catalogo]);

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

    if (!MallaManualService.validarPrerrequisitos(curso, mallaCompleta, semestres, targetSemestreId)) {
      alert(`No se puede asignar ${curso.asignatura}. Faltan prerrequisitos.`);
      return;
    }

    const semestreTarget = semestres.find(s => s.id === targetSemestreId);
    if (semestreTarget && semestreTarget.creditos + curso.creditos > 30) {
      alert('Límite de créditos excedido (máximo 30 por semestre)');
      return;
    }

    if (source === 'disponibles') {
      setCursosDisponibles(prev => prev.filter(c => c.codigo !== curso.codigo));
      setSemestres(prev => prev.map(semestre => {
        if (semestre.id === targetSemestreId) {
          return {
            ...semestre,
            cursos: [...semestre.cursos, curso],
            creditos: semestre.creditos + curso.creditos
          };
        }
        return semestre;
      }));
    } else if (source === 'semestre') {
      // Mover entre semestres
      setSemestres(prev => prev.map(semestre => {
        if (semestre.id === sourceSemestreId) {
          return {
            ...semestre,
            cursos: semestre.cursos.filter(c => c.codigo !== curso.codigo),
            creditos: semestre.creditos - curso.creditos
          };
        }
        if (semestre.id === targetSemestreId) {
          return {
            ...semestre,
            cursos: [...semestre.cursos, curso],
            creditos: semestre.creditos + curso.creditos
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
      const semestresRenumerados = semestresRestantes.map((semestre, index) => ({
        ...semestre,
        id: index + 1
      }));

      return semestresRenumerados;
    });
  };

  const guardarSimulacion = () => {
    MallaManualService.guardarSimulacion(semestres);
    setSimulacionGuardada(true);
    setTimeout(() => setSimulacionGuardada(false), 3000);
  };

  const reiniciarSimulacion = () => {
    if (window.confirm('¿Estás seguro de reiniciar toda la simulación?')) {
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

      {/* === CONTENIDO PRINCIPAL ENVUELTO === */}
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
      {/* === FIN CONTENIDO PRINCIPAL === */}
    </div>
  );
}

export default MallaManual;