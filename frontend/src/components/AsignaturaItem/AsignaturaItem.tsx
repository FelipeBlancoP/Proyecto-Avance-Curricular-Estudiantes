import { useState } from "react";
import { Asignatura } from "../../types/malla";
import "./AsignaturaItem.css";

interface Props {
  asignatura: Asignatura;
}

function AsignaturaItem({ asignatura }: Props) {
  console.log("Estado de la asignatura:", asignatura.estado);
  const estado = asignatura.estado?.toLowerCase() || "pendiente";


  return (
    <div className="asignatura-item" data-estado={estado}>
      <span className="asignatura-nombre">{asignatura.asignatura}</span>
      <span className="asignatura-creditos">{asignatura.creditos} CR</span>
    </div>
  );
}

export default AsignaturaItem;