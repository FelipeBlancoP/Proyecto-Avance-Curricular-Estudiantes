import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Estudiante } from '../../types/estudiante';
import { estudianteService } from '../../services/estudianteService';
import './Dashboard.css';

function Dashboard() {
  const [estudiante, setEstudiante] = useState<Estudiante | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const cargarPerfil = async () => {
      try {
        const perfil = await estudianteService.obtenerPerfil();
        setEstudiante(perfil);
      } catch (error) {
        console.error('Error al cargar perfil:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    cargarPerfil();
  }, [navigate]);

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Sistema de Avance Curricular UCN</h1>
      </header>

      <div className="welcome-section">
        <h2>Bienvenido, {estudiante?.email}</h2>
        <p>RUT: {estudiante?.rut}</p>
      </div>

      <div className="navigation-cards">
        <div className="nav-card" onClick={() => navigate('/informacion')}>
          <h3>👤 Información del Estudiante</h3>
          <p>Ver tu información personal y carreras</p>
        </div>

        <div className="nav-card" onClick={() => navigate('/malla')}>
          <h3>📊 Malla Automatizada</h3>
          <p>Ver malla curricular con avance automático</p>
        </div>

        <div className="nav-card">
          <h3>✏️ Malla Manual</h3>
          <p>Simular diferentes escenarios de avance</p>
        </div>

        <div className="nav-card">
          <h3>💾 Mallas Simuladas</h3>
          <p>Gestionar tus mallas guardadas</p>
        </div>
      </div>

      <div className="carreras-section">
        <h3>Tus Carreras:</h3>
        {estudiante?.carreras.map((carrera, index) => (
          <div key={index} className="carrera-card">
            <strong>{carrera.nombre}</strong>
            <p>Código: {carrera.codigo} | Catálogo: {carrera.catalogo}</p>
          </div>
        ))}
      </div>

      <div className="logout-section">
        <button onClick={async () => {
          const token = localStorage.getItem('access_token');
          if (token) {
            await fetch('http://localhost:3000/auth/logout', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
            });
          }
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          navigate('/login');
        }} className="logout-btn">
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

export default Dashboard;