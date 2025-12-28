import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import apiService from '../services/apiService';

export default function PreReporte() {
  const { modelId } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [segments, setSegments] = useState([]);

  // useEffect(() => {
  //   if (modelId) {
  //     fetchSegments();
  //   }
  // }, [modelId]);

  // const fetchSegments = async () => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const data = await apiService.getSegmentsReport();
  //     setSegments(data);
  //   } catch (err) {
  //     setError('No se pudo obtener el reporte de segmentos.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div style={styles.container}>
      <h1>Visualización Preeliminar para los Reportes</h1>

      {!modelId && (
        <Card style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #f39c12' }}>
          <p>⚠️ Debes entrenar el modelo antes de visualizar los segmentos.</p>
        </Card>
      )}

      {error && (
        <Card>
          <p style={styles.error}>{error}</p>
        </Card>
      )}

      {loading && (
        <Card>
          <p>Cargando reporte...</p>
        </Card>
      )}

      {/* ===== RESUMEN POR SEGMENTO ===== */}
      {!loading && segments.length > 0 && (
        <>
          <h2 style={styles.sectionTitle}>Resumen por Segmento</h2>

          <div style={styles.grid}>
            {segments.map((segment) => (
              <Card key={segment.cluster_id} title={`Segmento #${segment.cluster_id}`}>
                <ul style={styles.segmentList}>
                  <li>
                    <strong>Clientes en el segmento:</strong>{' '}
                    {segment.cantidad_clientes}
                  </li>
                  <li>
                    <strong>Promedio de gasto:</strong>{' '}
                    {segment.promedio_gasto}
                  </li>
                  <li>
                    <strong>Frecuencia promedio:</strong>{' '}
                    {segment.frecuencia_promedio}
                  </li>
                  <li>
                    <strong>Canal principal:</strong>{' '}
                    {segment.canal_top}
                  </li>
                  <li>
                    <strong>Ejemplo de reseña:</strong>
                    <br />
                    <em>{segment.ejemplo_reseña}</em>
                  </li>
                </ul>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* ===== GRAFICAS ===== */}
      {modelId && (
        <>
          <h2 style={{ ...styles.sectionTitle, color: "#000000ff" }}>Visualización de Clusters</h2>

          <div style={styles.grid}>
            <Card title="Distribución de Clientes por Segmento">
              <img src={`http://localhost:8000/reports/clientes_por_segmento.png?${Date.now()}`} style={styles.img} alt="Distribución de Clientes por Segmento"
              onError={e => { e.target.style.display = 'none'; e.target.parentNode.append("No disponible"); }} />
            </Card>
            <Card title="Promedio de Gasto por Segmento">
              <img src={`http://localhost:8000/reports/gasto_promedio_por_segmento.png?${Date.now()}`} style={styles.img} alt="Promedio de Gasto por Segmento"
              onError={e => { e.target.style.display = 'none'; e.target.parentNode.append("No disponible"); }} />
            </Card>
            <Card title="Frecuencia Promedio de Compra">
              <img src={`http://localhost:8000/reports/frecuencia_promedio_por_segmento.png?${Date.now()}`} style={styles.img} alt="Frecuencia Promedio de Compra"
              onError={e => { e.target.style.display = 'none'; e.target.parentNode.append("No disponible"); }} />
            </Card>
            <Card title="Canal Principal por Segmento">
              <img src={`http://localhost:8000/reports/canales_por_segmento.png?${Date.now()}`} style={styles.img} alt="Canal Principal por Segmento"
              onError={e => { e.target.style.display = 'none';  e.target.parentNode.append("No disponible");}} />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '2rem',
    marginTop: '1.5rem'
  },
  segmentList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  error: {
    color: '#e74c3c',
    fontWeight: 'bold'
  },
  sectionTitle: {
    marginTop: '3rem',
    marginBottom: '1rem'
  },
  img: {
    width: '100%',
    minHeight: '350px', // se aumenta la altura mínima
    maxHeight: '500px', // se aumenta la altura máxima
    objectFit: 'contain'
  }
};
