import { Semestre } from "../../pages/MallaPage/mallaPage"; 
import SemestreCard from "../SemestreCard/SemestreCard";
import "./MallaTimeline.css"; 

interface Props {
  semestres: Semestre[];
}

function MallaTimeline({ semestres }: Props) {
  return (
    <div className="timeline-container">
      {semestres.map((semestre) => (
        <SemestreCard
          key={semestre.nivel}
          nivel={semestre.nivel}
          asignaturas={semestre.asignaturas}
          totalCreditos={semestre.totalCreditos}
        />
      ))}
    </div>
  );
}

export default MallaTimeline;