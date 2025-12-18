import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import ThemeToggle from '../../components/TemaToggle/TemaToggle';
import { Estudiante } from '../../types/estudiante';
import { estudianteService } from '../../services/estudianteService';


function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [estudiante, setEstudiante] = useState<Estudiante | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [avance, setAvance] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    try {
      const userParsed = JSON.parse(userData);
      setUser(userParsed);
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const cargarAvance = async () => {
      try {
        const data = await estudianteService.obtenerAvance();
        setAvance(data);
      } catch (e) {
        console.error(e);
      }
    };
    cargarAvance();
  }, []);

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="dashboard-layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <button
          className="toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>

        {sidebarOpen && (
          <div className="sidebar-content">
            <div className="sidebar-image-container">
              <img src="src/images/usuario.png" alt="Foto usuario" className="sidebar-image" />
            </div>
            <h2>Datos Personales</h2>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>RUT:</strong> {user?.rut}</p>

            <div className="carreras-section">
              <h2>Tus Carreras:</h2>
              {estudiante?.carreras.map((carrera, index) => (
                <div key={index} className="carrera-card">
                  <strong>{carrera.nombre}</strong>
                  <p>Código: {carrera.codigo} | Catálogo: {carrera.catalogo}</p>
                </div>
              ))}
            </div>

            <div className="avance-section">
              <h3>Avance</h3>
              {avance && (
                <>
                  <p>{avance.porcentaje}% completado</p>
                  <progress value={avance.porcentaje} max={100} />
                  <p>
                    {avance.creditosAprobados} / {avance.creditosTotales} créditos
                  </p>
                </>
              )}
            </div>

          </div>

        )}
      </aside>
      <div className="dashboard-container">
        <div className="welcome-section">
          <h2>Bienvenido, {user?.email}</h2>
          <ThemeToggle />
        </div>

        <div className="navigation-cards">
          <div className="nav-card" onClick={() => navigate('/malla')}>
            <h3>📊 Malla Automatizada</h3>
            <p>Ver malla curricular con avance automático</p>
          </div>

          <div className="nav-card">
            <h3>✏️ Malla Manual</h3>
            <p>Simular diferentes escenarios de avance</p>
          </div>
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
    </div>
  );
}

export default Dashboard;