import { Estudiante } from '../types/estudiante';

const API_URL = 'http://localhost:3000';

export const estudianteService = {
  async obtenerPerfil(): Promise<Estudiante> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/estudiante/perfil`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Error al obtener perfil');
    return response.json();
  },

  async obtenerAvance() {
    const token = localStorage.getItem('access_token');

    const res = await fetch(`${API_URL}/estudiante/avance`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Error al obtener avance');
    return res.json();
  },

}