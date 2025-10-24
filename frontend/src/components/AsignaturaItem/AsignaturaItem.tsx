// src/components/AsignaturaItem/AsignaturaItem.tsx

import { useState } from "react";
import { Asignatura } from "../../types/malla";
import "./AsignaturaItem.css"; // Importamos el CSS

interface Props {
  asignatura: Asignatura;
}

function AsignaturaItem({ asignatura }: Props) {
  // Aquí puedes agregar un estado para el progreso (aprobado, cursando, etc.)
  const [estado, setEstado] = useState("pendiente");

  return (
    <div className="asignatura-item" data-estado={estado}>
      <span className="asignatura-nombre">{asignatura.asignatura}</span>
      <span className="asignatura-creditos">{asignatura.creditos} CR</span>
      {/* Podríamos agregar un botón/ícono para ver pre-requisitos */}
      {/* <button>Ver Prereq: {asignatura.prereq}</button> */}
    </div>
  );
}

export default AsignaturaItem;