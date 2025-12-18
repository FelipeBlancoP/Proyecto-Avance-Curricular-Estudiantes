import { useState } from "react"; 
import { Asignatura } from "../../types/malla";
import AsignaturaItem from "../AsignaturaItem/AsignaturaItem";
import "./SemestreCard.css"; 

interface Props {
  nivel: number;
  asignaturas: Asignatura[];
  totalCreditos?: number;
}

function SemestreCard({ nivel, asignaturas, totalCreditos }: Props) {
  
  const [isExpanded, setIsExpanded] = useState(false);

  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const getCreditosClass = (cr: number) => {
      if (cr > 30) return "creditos-exceso";
      if (cr === 30) return "creditos-full";
      return "creditos-normal";
  };

  return (
    <div className={`semestre-item ${isExpanded ? "is-expanded" : ""}`}>
      <div className="semestre-card">

        {/* 1. Header del Semestre (Clickeable para expandir) */}
        <div className="semestre-header" onClick={toggleExpand}>
             <h2 className="semestre-titulo">Semestre {nivel}</h2>
          <span className="expand-icon">▼</span>
        </div>

        {/* 2. NUEVA SECCIÓN: Barra de créditos (Solo si totalCreditos existe) */}
        {totalCreditos !== undefined && (
            <div className="semestre-creditos-bar">
                <strong>{totalCreditos} créditos</strong>
            </div>
        )}

        {/* 3. Contenedor de la lista de asignaturas */}
        <div className="asignaturas-list-container">
          <div className="asignaturas-list">
            {asignaturas.map((asignatura) => (
              <AsignaturaItem key={asignatura.codigo} asignatura={asignatura} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SemestreCard;