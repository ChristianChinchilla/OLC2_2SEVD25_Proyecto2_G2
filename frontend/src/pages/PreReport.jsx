import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import apiService from '../services/apiService';

export default function Predict() {
  const { modelId } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [segments, setSegments] = useState([]);

  useEffect(() => {
    if (modelId) {
      fetchSegments();
    }
  }, [modelId]);

  const fetchSegments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getSegmentsReport();
      setSegments(data);
    } catch (err) {
      setError('No se pudo obtener el reporte de segmentos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Reporte Preliminar de Segmentos</h1>

      {!modelId && (
        <Card style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #f39c12' }}>
          <p>⚠️ Debes entrenar el modelo antes de visualizar los segmentos.</p>
        </Card>
      )}

      {error && <Card><p style={styles.error}>{error}</p></Card>}

      {loading && <Card><p>Cargando reporte...</p></Card>}

      {!loading && segments.length > 0 && (
        <div style={styles.grid}>
          {segments.map((segment) => (
            <Card key={segment.cluster_id} title={`Segmento #${segment.cluster_id}`}>
              <ul style={styles.segmentList}>
                <li><strong>Clientes en el segmento:</strong> {segment.cantidad_clientes}</li>
                <li><strong>Promedio de gasto:</strong> {segment.promedio_gasto}</li>
                <li><strong>Frecuencia promedio:</strong> {segment.frecuencia_promedio}</li>
                <li><strong>Canal principal:</strong> {segment.canal_top}</li>
                <li><strong>Ejemplo de reseña:</strong> <em>{segment.ejemplo_reseña}</em></li>
              </ul>
            </Card>
          ))}
        </div>
      )}

      {!loading && modelId && segments.length === 0 && (
        <Card>
          <p>No hay segmentos para mostrar. Asegúrate de haber entrenado el modelo correctamente.</p>
        </Card>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' },
  segmentList: { listStyle: 'none', padding: 0, margin: 0 },
  error: { color: '#e74c3c', fontWeight: 'bold' },
};