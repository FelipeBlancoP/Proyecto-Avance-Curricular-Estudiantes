import React, { useState } from 'react';
import { obtenerMalla } from '../services/mallaService';

const MallaCurricular: React.FC = () => {
  const [codigo, setCodigo] = useState('');
  const [malla, setMalla] = useState<any>(null);

  const handleBuscar = async () => {
    try {
      const data = await obtenerMalla(codigo);
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
        placeholder="8266-202410"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
      />
      <button onClick={handleBuscar}>Buscar</button>

      {malla && (
        <pre>{JSON.stringify(malla, null, 2)}</pre>
      )}
    </div>
  );
};

export default MallaCurricular;
