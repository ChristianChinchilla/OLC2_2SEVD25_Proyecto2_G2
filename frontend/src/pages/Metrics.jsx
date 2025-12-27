import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import apiService from '../services/apiService';

export default function Metrics() {
  const { modelId, metrics, setMetrics, checkMetrics } = useAppContext();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Solo intentamos buscar métricas si hay un modelo entrenado (modelId)
    // y no tenemos las métricas ya cargadas.
    if (modelId && !metrics) {
      fetchMetrics();
    }
  }, [modelId]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await apiService.getMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Error al obtener métricas:', err);
    } finally {
      setLoading(false);
    }
  };

  const metricsData = [
    { label: 'Inercia (Inertia)', value: metrics?.inertia, color: '#3498db', icon: '🌀' },
    { label: 'Silhouette', value: metrics?.silhouette, color: '#e67e22', icon: '📏' },
    { label: 'Calinski-Harabasz', value: metrics?.calinski_harabasz, color: '#9b59b6', icon: '📊' },
    { label: 'Davies-Bouldin', value: metrics?.davies_bouldin, color: '#e74c3c', icon: '📉' },
  ];

  // Función auxiliar para saber si un valor es válido (no null ni undefined)
  const isValid = (val) => val !== undefined && val !== null;

  return (
    <div style={styles.container}>
      <h1>Evaluación de Rendimiento</h1>
      
      {/* Mensaje informativo si no hay modelo entrenado aún */}
      {!metrics && (
        <Card style={{ backgroundColor: '#e8f4fd', borderLeft: '4px solid #3498db' }}>
          <p>ℹ️ Aún no hay métricas disponibles. Ve a la pestaña <strong>Entrenamiento</strong> para generar un modelo.</p>
        </Card>
      )}

      <div style={styles.grid}>
        {metricsData.map((metric, index) => (
          <Card key={index} style={{ borderTop: `4px solid ${metric.color}` }}>
            <div style={styles.metricCard}>
              <span style={styles.icon}>{metric.icon}</span>
              <h3 style={styles.metricLabel}>{metric.label}</h3>
              <p style={{ ...styles.metricValue, color: metric.color }}>
                {/* AQUI ESTÁ EL CAMBIO: Si hay valor, muestra número. Si no, guion */}
                {isValid(metric.value) ? Number(metric.value).toFixed(2) : '-'}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Solo mostramos el estado de validación si hay métricas reales */}
      {metrics && (
        <Card title="Validación del Modelo de Clustering">
          <ul style={{ marginBottom: '1rem', marginTop: 0 }}>
            <li><strong>Inercia:</strong> Que el valor sea lo mas bajo posible (clusters más compactos).</li>
            <li><strong>Silhouette:</strong> Que el resultado sea lo mas cercano a 1 (Bueno: mayor que 0.5) (Aceptable: 0.25 - 0.5)</li>
            <li><strong>Calinski-Harabasz:</strong> Que el valor sea lo mas alto posible (buena separación entre clusters).</li>
            <li><strong>Davies-Bouldin:</strong> Que el valor sea lo mas bajo posible (Bueno: menor que 1) (Aceptable: 1 - 2).</li>
          </ul>
        </Card>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  metricCard: { textAlign: 'center' },
  icon: { fontSize: '2.5rem' },
  metricLabel: { fontSize: '1rem', margin: '0.5rem 0', color: '#34495e' },
  metricValue: { fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' },
  success: { color: '#27ae60', fontWeight: 'bold' },
  warning: { color: '#f39c12', fontWeight: 'bold' },
  info: { marginTop: '1rem', fontSize: '0.9rem', color: '#7f8c8d' },
};