// src/components/SemestreCard/SemestreCard.tsx

import { useState } from "react"; // 1. Importamos useState
import { Asignatura } from "../../types/malla";
import AsignaturaItem from "../AsignaturaItem/AsignaturaItem";
import "./SemestreCard.css"; // Importamos el CSS

interface Props {
  nivel: number;
  asignaturas: Asignatura[];
}

function SemestreCard({ nivel, asignaturas }: Props) {
  // 2. Añadimos el estado. Por defecto, estará colapsado (false)
  const [isExpanded, setIsExpanded] = useState(false);

  // 3. Creamos una función para cambiar el estado
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    // 4. Añadimos una clase dinámica para que el CSS sepa si está expandido
    <div className={`semestre-item ${isExpanded ? "is-expanded" : ""}`}>
      {/* El punto en la línea sigue igual (manejado por CSS) */}

      <div className="semestre-card">
        {/* 5. Convertimos el título en un "botón" */}
        <div className="semestre-header" onClick={toggleExpand}>
          <h2 className="semestre-titulo">Semestre {nivel}</h2>
          {/* 6. Añadimos un ícono que rota */}
          <span className="expand-icon">▼</span>
        </div>

        {/* 7. El contenido (la lista) ahora se renderiza con animación (vía CSS) */}
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