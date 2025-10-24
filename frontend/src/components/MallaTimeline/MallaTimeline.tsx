// src/components/MallaTimeline/MallaTimeline.tsx

import { Semestre } from "../../pages/MallaPage/mallaPage"; // Importamos el tipo desde MallaPage
import SemestreCard from "../SemestreCard/SemestreCard";
import "./MallaTimeline.css"; // Importamos el CSS

interface Props {
  semestres: Semestre[];
}

function MallaTimeline({ semestres }: Props) {
  return (
    <div className="timeline-container">
      {/* La línea del timeline se crea con CSS (ver .css) */}
      {semestres.map((semestre) => (
        <SemestreCard
          key={semestre.nivel}
          nivel={semestre.nivel}
          asignaturas={semestre.asignaturas}
        />
      ))}
    </div>
  );
}

export default MallaTimeline;