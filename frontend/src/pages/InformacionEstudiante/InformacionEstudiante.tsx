import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Estudiante, AvanceCurso } from '../../types/estudiante';
import { estudianteService } from '../../services/estudianteService';
import './InformacionEstudiante.css';

function InformacionEstudiante() {
  const [estudiante, setEstudiante] = useState<Estudiante | null>(null);
  const [avances, setAvances] = useState<{ [key: string]: AvanceCurso[] }>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const cargarDatos = async () => {
      try {
        const perfil = await estudianteService.obtenerPerfil();
        setEstudiante(perfil);
        
        // Cargar avance para todas las carreras
        perfil.carreras.forEach(carrera => {
          cargarAvance(carrera.codigo);
        });
      } catch (error) {
        console.error('Error al cargar datos:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [navigate]);

  const cargarAvance = async (codigoCarrera: string) => {
    try {
      const avance = await estudianteService.obtenerAvance(codigoCarrera);
      setAvances(prev => ({
        ...prev,
        [codigoCarrera]: avance
      }));
    } catch (error) {
      console.error('Error al cargar avance:', error);
    }
  };

  const getEstadisticas = (carreraCodigo: string) => {
    const avanceCarrera = avances[carreraCodigo] || [];
    const totalCursos = avanceCarrera.length;
    const aprobados = avanceCarrera.filter(curso => curso.status === 'APROBADO').length;
    const reprobados = avanceCarrera.filter(curso => curso.status === 'REPROBADO').length;
    
    return { totalCursos, aprobados, reprobados };
  };

  if (loading) {
    return <div className="loading">Cargando información...</div>;
  }

  return (
    <div className="informacion-container">
      <header className="informacion-header">
        <h1>Información del Estudiante</h1>
      </header>

      <div className="perfil-section">
        <h2>Datos Personales</h2>
        <div className="perfil-card">
          <p><strong>RUT:</strong> {estudiante?.rut}</p>
          <p><strong>Email:</strong> {estudiante?.email}</p>
          <p><strong>Carrera(s):</strong> {estudiante?.carreras.map(c => c.nombre).join(', ')}</p>
        </div>
      </div>

      <div className="carreras-section">
        <h2>Detalle de Carreras</h2>

        {estudiante?.carreras.map((carrera, index) => (
          <div key={index} className="carrera-detalle">
            <h3>{carrera.nombre}</h3>
            <p><strong>Código:</strong> {carrera.codigo}</p>
            <p><strong>Catálogo:</strong> {carrera.catalogo}</p>
            
            {avances[carrera.codigo] && (
              <div className="avance-section">
                <h4>Avance Curricular</h4>
                <div className="estadisticas">
                  {(() => {
                    const stats = getEstadisticas(carrera.codigo);
                    return (
                      <>
                        <div className="stat-card aprobados">
                          <span>Aprobados: {stats.aprobados}</span>
                        </div>
                        <div className="stat-card reprobados">
                          <span>Reprobados: {stats.reprobados}</span>
                        </div>
                        <div className="stat-card total">
                          <span>Total: {stats.totalCursos}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="cursos-lista">
                  <h5>Cursos:</h5>
                  {avances[carrera.codigo].map((curso, idx) => (
                    <div key={idx} className={`curso-item ${curso.status.toLowerCase()}`}>
                      <span className="curso-codigo">{curso.course}</span>
                      <span className="curso-status">{curso.status}</span>
                      <span className="curso-periodo">{curso.period}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="logout-section">
        <button onClick={() => {
          const token = localStorage.getItem('access_token');
          if (token) {
            fetch('http://localhost:3000/auth/logout', {
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

export default InformacionEstudiante;