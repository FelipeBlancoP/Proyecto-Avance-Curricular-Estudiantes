import { useState } from "react"; 
import { Asignatura } from "../../types/malla";
import AsignaturaItem from "../AsignaturaItem/AsignaturaItem";
import "./SemestreCard.css"; 

interface Props {
  nivel: number;
  asignaturas: Asignatura[];
}

function SemestreCard({ nivel, asignaturas }: Props) {
  
  const [isExpanded, setIsExpanded] = useState(false);

  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    
    <div className={`semestre-item ${isExpanded ? "is-expanded" : ""}`}>

      <div className="semestre-card">
        <div className="semestre-header" onClick={toggleExpand}>
          <h2 className="semestre-titulo">Semestre {nivel}</h2>
          <span className="expand-icon">▼</span>
        </div>

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