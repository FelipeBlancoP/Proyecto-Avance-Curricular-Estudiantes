import { Asignatura } from '../../types/malla';
import './CursosDisponibles.css';

interface CursosDisponiblesProps {
  cursos: Asignatura[];
  onDragStart: (e: React.DragEvent, curso: Asignatura) => void;
}

function CursosDisponibles({ cursos, onDragStart }: CursosDisponiblesProps) {
  // Agrupar cursos por nivel
  const cursosPorNivel = cursos.reduce((acc, curso) => {
    const nivel = curso.nivel;
    if (!acc[nivel]) acc[nivel] = [];
    acc[nivel].push(curso);
    return acc;
  }, {} as Record<number, Asignatura[]>);

  const niveles = Object.keys(cursosPorNivel)
    .map(Number)
    .sort((a, b) => a - b);

  if (cursos.length === 0) {
    return (
      <div className="cursos-vacio">
        <p>✅ Todos los cursos han sido asignados a semestres</p>
        <p className="subtitulo-vacio">Puedes devolver cursos arrastrándolos desde los semestres</p>
      </div>
    );
  }

  return (
    <div className="cursos-disponibles">
      {niveles.map(nivel => (
        <div key={nivel} className="nivel-container">
          <h3 className="nivel-titulo">Nivel {nivel}</h3>
          <div className="cursos-grid">
            {cursosPorNivel[nivel].map(curso => (
              <div
                key={curso.codigo}
                className="curso-item"
                draggable="true"
                onDragStart={(e) => onDragStart(e, curso)}
                title={`Arrastrar: ${curso.asignatura}`}
              >
                <div className="curso-codigo">{curso.codigo}</div>
                <div className="curso-nombre">{curso.asignatura}</div>
                <div className="curso-detalles">
                  <span className="curso-creditos">{curso.creditos} créditos</span>
                  {curso.prereq && curso.prereq.length > 0 && (
                    <span className="curso-prereq">
                      📋 {curso.prereq.length} prereq
                    </span>
                  )}
                </div>
                {curso.estado && curso.estado !== 'No cursado' && (
                  <div className={`curso-estado estado-${curso.estado.toLowerCase()}`}>
                    {curso.estado}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CursosDisponibles;