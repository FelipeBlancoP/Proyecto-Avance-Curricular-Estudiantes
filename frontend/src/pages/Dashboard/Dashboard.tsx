import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Sistema de Avance Curricular UCN</h1>
      </header>

      <div className="welcome-section">
        <h2>Bienvenido, {user?.email}</h2>
        <p>RUT: {user?.rut}</p>
      </div>

      <div className="main-content">
        <div className="options-section">
          <h3>¿Qué te gustaría hacer?</h3>
          
          <div className="options-buttons">
            <button 
              className="option-button automated" 
              onClick={() => navigate('/malla')}
            >
              <span className="option-icon">📊</span>
              <div className="option-content">
                <h4>Malla Automatizada</h4>
                <p>Ver malla curricular con avance automático</p>
              </div>
            </button>

            <button 
              className="option-button manual"
               onClick={() => navigate('/malla-manual')}
            >
              <span className="option-icon">✏️</span>
              <div className="option-content">
                <h4>Malla Manual</h4>
                <p>Simular diferentes escenarios de avance</p>
              </div>
            </button>
          </div>
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
  );
}

export default Dashboard;