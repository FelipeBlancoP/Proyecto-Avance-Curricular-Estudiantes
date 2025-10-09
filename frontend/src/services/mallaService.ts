export const obtenerMalla = async (codigoCarrera: string) => {
  const response = await fetch(`http://localhost:3000/malla?codigoCarrera=${codigoCarrera}`);
  if (!response.ok) throw new Error('Error al obtener la malla curricular');
  return response.json();
};
