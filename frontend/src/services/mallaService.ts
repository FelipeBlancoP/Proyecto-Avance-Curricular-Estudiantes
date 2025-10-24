import { Malla } from "../types/malla";

export const obtenerMalla = async (codigoCarrera: string, catalogo: string): Promise<Malla> => {
  const response = await fetch(`http://localhost:3000/malla?codigoCarrera=${codigoCarrera}&catalogo=${catalogo}`);

  if (!response.ok) throw new Error('Error al obtener malla');
  
  return response.json();
};
