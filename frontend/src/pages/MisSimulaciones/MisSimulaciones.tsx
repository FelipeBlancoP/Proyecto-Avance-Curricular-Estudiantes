import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MallaManualService from '../../services/MallaManualService';
import MallaTimeline from '../../components/MallaTimeline/MallaTimeline';
import './MisSimulaciones.css';

interface SimulacionItem {
  id: number;
  nombre: string;
  fechaCreacion: string;
}

function MisSimulaciones() {
  const navigate = useNavigate();
  const [lista, setLista] = useState<SimulacionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detallesCache, setDetallesCache] = useState<Record<number, any[]>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);

  useEffect(() => {
    cargarLista();
  }, []);

  const cargarLista = async () => {
    setLoading(true);
    const data = await MallaManualService.obtenerMisSimulaciones();
    setLista(data);
    setLoading(false);
  };

  const toggleSimulacion = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(id);

    if (!detallesCache[id]) {
      setLoadingId(id);
      const detalle = await MallaManualService.cargarSimulacion(id);
      if (detalle) {
        setDetallesCache(prev => ({ ...prev, [id]: detalle.semestres }));
      }
      setLoadingId(null);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="mis-simulaciones-container">
      <div className="top-bar">
        <button onClick={() => navigate('/malla-manual')} className="back-btn">
          🡰 Volver a Malla Manual
        </button>
        <h1>Mis Simulaciones Guardadas</h1>
      </div>

      <div className="simulaciones-list">
        {loading ? (
          <div className="loading-msg">Cargando simulaciones...</div>
        ) : lista.length === 0 ? (
          <div className="empty-msg">No tienes simulaciones guardadas aún.</div>
        ) : (
          lista.map((sim) => (
            <div key={sim.id} className="simulacion-item-wrapper">
              
              <button
                className={`desplegable-malla-btn ${expandedId === sim.id ? 'active' : ''}`}
                onClick={() => toggleSimulacion(sim.id)}
              >
                <div className="btn-content">
                    <span className="sim-title">{sim.nombre}</span>
                    <span className="sim-date">{formatearFecha(sim.fechaCreacion)}</span>
                </div>
                <span className="arrow-icon">
                    {expandedId === sim.id ? "▲" : "▼"}
                </span>
              </button>

              {expandedId === sim.id && (
                <div className="timeline-container-animado">
                  {loadingId === sim.id ? (
                    <div style={{padding: '2rem', textAlign: 'center'}}>Cargando detalle...</div>
                  ) : (
                    detallesCache[sim.id] ? (
                      <div className="timeline-wrapper">
                         <MallaTimeline semestres={detallesCache[sim.id]} />
                      </div>
                    ) : (
                      <div className="error-msg">Error al cargar la simulación.</div>
                    )
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MisSimulaciones;