import React, { useState } from 'react';
import { obtenerMalla } from '../services/mallaService';

const MallaCurricular: React.FC = () => {
  const [codigoCarrera, setCodigoCarrera] = useState('');
  const [catalogo, setCatalogo] = useState('');
  const [malla, setMalla] = useState<any>(null);

  const handleBuscar = async () => {
    try {
      const data = await obtenerMalla(codigoCarrera, catalogo);
      setMalla(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Buscar Malla Curricular</h2>

      <input
        type="text"
        placeholder="Código de carrera"
        value={codigoCarrera}
        onChange={(e) => setCodigoCarrera(e.target.value)}
      />

      <input
        type="text"
        placeholder="Catálogo"
        value={catalogo}
        onChange={(e) => setCatalogo(e.target.value)}
      />

      <button onClick={handleBuscar}>Buscar</button>

      {malla && (
        <pre>{JSON.stringify(malla, null, 2)}</pre>
      )}
    </div>
  );
};

export default MallaCurricular;

