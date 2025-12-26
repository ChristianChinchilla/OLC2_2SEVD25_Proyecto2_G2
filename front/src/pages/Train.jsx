import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import apiService from '../services/apiService';

export default function Train() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trainingLog, setTrainingLog] = useState(null);
  const { datasetId, isCleaned, setModelId, setMetrics, checkMetrics } = useAppContext();
  const [config, setConfig] = useState({
    n_estimators: 100,
    max_depth: null,
    min_samples_leaf: 1,
  });

  const handleTrain = async () => {
    if (!datasetId || !isCleaned) {
      setError('Debes cargar un dataset antes de entrenar');
      return;
    }

    setLoading(true);
    setError(null);
    setTrainingLog(null);
    const startTime = Date.now();

    try {
      const data = await apiService.trainModel(config);
      const endTime = Date.now();
      const trainingTime = ((endTime - startTime) / 1000).toFixed(2);
      
      setModelId('trained_model'); // ID del modelo entrenado
      setMetrics(data.metrics);
      checkMetrics(data.metrics);
      setTrainingLog({
        time: trainingTime,
        status: 'success',
        message: data.message,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>🤖 Entrenamiento del Modelo</h1>

      <Card title="Configuración de Hiperparámetros">
        {!isCleaned && (
          <p style={styles.warning}>⚠️ Primero debes cargar un dataset en la página de Carga Masiva</p>
        )}
        
        <label style={styles.label}>
          Número de árboles (n_estimators):
          <input
            type="number"
            value={config.n_estimators}
            onChange={(e) => setConfig({ ...config, n_estimators: parseInt(e.target.value) })}
            style={styles.input}
            min="1"
            max="500"
          />
        </label>

        <label style={styles.label}>
          Profundidad máxima (max_depth):
          <input
            type="number"
            value={config.max_depth || ''}
            onChange={(e) => setConfig({ ...config, max_depth: e.target.value ? parseInt(e.target.value) : null })}
            style={styles.input}
            placeholder="Sin límite"
            min="1"
          />
        </label>

        <label style={styles.label}>
          Muestras mínimas por hoja (min_samples_leaf):
          <input
            type="number"
            value={config.min_samples_leaf}
            onChange={(e) => setConfig({ ...config, min_samples_leaf: parseInt(e.target.value) })}
            style={styles.input}
            min="1"
          />
        </label>

        <button onClick={handleTrain} disabled={loading || !isCleaned} style={{
          ...styles.button,
          ...((loading || !isCleaned) && styles.buttonDisabled)
        }}>
          {loading ? 'Entrenando...' : 'Entrenar Modelo'}
        </button>
        {error && <p style={styles.error}>❌ {error}</p>}
      </Card>

      {trainingLog && (
        <Card title="Log de Entrenamiento">
          <p><strong>Estado:</strong> {trainingLog.status}</p>
          <p><strong>Tiempo de entrenamiento:</strong> {trainingLog.time}s</p>
          {trainingLog.message && <p><strong>Mensaje:</strong> {trainingLog.message}</p>}
          <p style={styles.success}>✅ Modelo entrenado exitosamente</p>
        </Card>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '800px', margin: '0 auto' },
  label: { display: 'block', marginBottom: '1rem', fontWeight: 'bold' },
  input: { display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.5rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ddd' },
  button: { padding: '0.75rem 2rem', backgroundColor: '#9b59b6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', marginTop: '1rem' },
  buttonDisabled: { backgroundColor: '#95a5a6', cursor: 'not-allowed', opacity: 0.6 },
  error: { color: '#e74c3c', marginTop: '1rem' },
  warning: { color: '#f39c12', marginBottom: '1rem', fontWeight: 'bold' },
  success: { color: '#27ae60', fontWeight: 'bold', marginTop: '1rem' },
};
