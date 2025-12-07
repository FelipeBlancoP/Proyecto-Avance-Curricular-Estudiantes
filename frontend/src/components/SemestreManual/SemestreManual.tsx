import { Asignatura } from '../../types/malla';
import './SemestreManual.css';

interface Semestre {
  id: number;
  cursos: Asignatura[];
  creditos: number;
}

interface SemestreManualProps {
  semestre: Semestre;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, curso: Asignatura) => void;
  onEliminarSemestre: () => void;
}

function SemestreManual({ 
  semestre, 
  onDragOver, 
  onDrop, 
  onDragStart,
  onEliminarSemestre 
}: SemestreManualProps) {
  const limiteCreditos = 30;
  const porcentajeUso = (semestre.creditos / limiteCreditos) * 100;
  const estaCercaDelLimite = semestre.creditos > limiteCreditos * 0.8;
  const excedeLimite = semestre.creditos > limiteCreditos;

  return (
    <div 
      className={`semestre-manual ${excedeLimite ? 'excede-limite' : ''}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="semestre-header">
        <h3>Semestre {semestre.id}</h3>
        <button 
          onClick={onEliminarSemestre}
          className="eliminar-semestre-btn"
          title="Eliminar semestre"
        >
          🗑️
        </button>
      </div>
      
      <div className="creditos-info">
        <div className="creditos-bar">
          <div 
            className="creditos-progreso"
            style={{ width: `${Math.min(porcentajeUso, 100)}%` }}
          ></div>
        </div>
        <div className="creditos-texto">
          <span className={`creditos-numero ${excedeLimite ? 'excede' : ''}`}>
            {semestre.creditos}
          </span>
          <span className="creditos-limite"> / {limiteCreditos} créditos</span>
          {excedeLimite && (
            <span className="creditos-alerta"> ⚠️ Excede límite</span>
          )}
        </div>
      </div>

      <div className="cursos-container">
        {semestre.cursos.length === 0 ? (
          <div className="semestre-vacio">
            <p>Arrastra cursos aquí</p>
            <p className="subtitulo-vacio">Suelta para asignar al semestre</p>
          </div>
        ) : (
          <div className="cursos-list">
            {semestre.cursos.map(curso => (
              <div
                key={curso.codigo}
                className="curso-semestre"
                draggable="true"
                onDragStart={(e) => onDragStart(e, curso)}
                title={`Arrastrar: ${curso.asignatura}`}
              >
                <div className="curso-info">
                  <div className="curso-codigo-sm">{curso.codigo}</div>
                  <div className="curso-nombre-sm">{curso.asignatura}</div>
                </div>
                <div className="curso-creditos-sm">{curso.creditos} cr</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="semestre-footer">
        <span className="cursos-count">
          {semestre.cursos.length} curso{semestre.cursos.length !== 1 ? 's' : ''}
        </span>
        {estaCercaDelLimite && !excedeLimite && (
          <span className="advertencia">⚠️ Cerca del límite</span>
        )}
      </div>
    </div>
  );
}

export default SemestreManual;