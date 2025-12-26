import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import apiService from '../services/apiService';

export default function Tune() {
  const { isCleaned, setModelId, setMetrics, checkMetrics } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  //Algoritmo seleccionable
  const [algorithmVariant, setAlgorithmVariant] = useState("K-Means");

  // Hiperparámetros para clustering
  const [nClusters, setNClusters] = useState(3);
  const [maxIter, setMaxIter] = useState(300);

  const handleRetrain = async () => {
    if (!isCleaned) {
      setError("No hay datos listos. Ve a 'Limpieza' primero.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const config = {
        n_clusters: nClusters,
        max_iter: maxIter,
        algorithm_variant: algorithmVariant,
      };

      const data = await apiService.trainModel(config);

      setModelId("modelo_" + algorithmVariant.toLowerCase());
      setMetrics(data.metrics);
      checkMetrics(data.metrics);

      alert('✅ Modelo reentrenado exitosamente. Ve a la pestaña "Evaluación" para ver los cambios.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Configuración del Modelo</h1>

      {!isCleaned && (
        <Card style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #f39c12' }}>
          <p>⚠️ No hay datos cargados o limpios. Por favor realiza la <strong>Carga Masiva</strong> y <strong>Limpieza</strong> primero.</p>
        </Card>
      )}

      <Card title="Configuración de Clustering">
        <div style={styles.sliderContainer}>
          {/* Selección de algoritmo, si es que en un futuro se agregan mas algoritmos */}
          <label style={styles.label}>
            Algoritmo:
            <select
              value={algorithmVariant}
              onChange={e => setAlgorithmVariant(e.target.value)}
              style={{ ...styles.slider, padding: '0.5rem', marginTop: '0.5rem' }}
            >
              <option value="K-Means">K-Means</option>
              {/* Puedes agregar más algoritmos aquí en el futuro */}
            </select>
          </label>

          {/* SLIDER 1: Número de clusters */}
          <label style={styles.label}>
            Número de clusters (n_clusters): <strong>{nClusters}</strong>
            <input
              type="range"
              min="2"
              max="10"
              value={nClusters}
              onChange={(e) => setNClusters(Number(e.target.value))}
              style={styles.slider}
            />
          </label>

          {/* SLIDER 2: Iteraciones máximas */}
          <label style={styles.label}>
            Iteraciones máximas (max_iter): <strong>{maxIter}</strong>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={maxIter}
              onChange={(e) => setMaxIter(Number(e.target.value))}
              style={styles.slider}
            />
          </label>
        </div>

        <button
          onClick={handleRetrain}
          disabled={loading || !isCleaned}
          style={{
            ...styles.button,
            ...((loading || !isCleaned) && styles.buttonDisabled)
          }}
        >
          {loading ? 'Entrenando...' : 'Entrenar / Reentrenar Modelo'}
        </button>

        {error && <p style={styles.error}>❌ {error}</p>}
      </Card>
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '800px', margin: '0 auto' },
  sliderContainer: { marginBottom: '2rem' },
  label: { display: 'block', marginBottom: '1.5rem', fontWeight: 'bold', color: '#2c3e50' },
  slider: { display: 'block', width: '100%', marginTop: '0.5rem', accentColor: '#3498db' },
  button: {
    padding: '0.75rem 2rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'opacity 0.3s'
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
    cursor: 'not-allowed',
    opacity: 0.7
  },
  error: { color: '#e74c3c', marginTop: '1rem', fontWeight: 'bold' },
};