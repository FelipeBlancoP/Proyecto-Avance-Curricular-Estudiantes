import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logoUCN from '../../images/logoUCN.png';
import ucenin from '../../images/ucenin.png';

function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      } else {
        setError(data.message || 'Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="info-section">
          <div className="welcome-message">
            <h1>Sistema de Avance Curricular</h1>
          </div>

          <div className="description">
            <p>Esta plataforma le permite realizar un seguimiento detallado de su progreso académico, verificar el estado de sus asignaturas y planificar su trayectoria educativa.</p>
            <div className="ucenin-logo-container">
              <img src={ucenin} alt="Ucenin" className="ucenin-logo" />
            </div>
          </div>
        </div>

        <div className="login-container">
          <div className="login-section">
            <img src={logoUCN} alt="Logo UCN" className="login-logo" />
            <div className="university-name">
              <h3>Universidad Católica del Norte</h3>
            </div>

            <h2 className="login-title">Inicio de Sesión</h2>

            <form onSubmit={handleLogin} className="login-form">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Correo"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>

            <div className="convio-option">
              <a href="#">¿Olvidaste tu contraseña?</a>
            </div>

            {error && <div className="error-message">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;