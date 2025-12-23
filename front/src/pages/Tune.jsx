import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import apiService from '../services/apiService'; // Importamos el servicio

export default function Tune() {
  const { isCleaned, setModelId, setMetrics, checkMetrics } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hiperparámetros (Coinciden con main.py del backend)
  const [nEstimators, setNEstimators] = useState(100);
  const [maxDepth, setMaxDepth] = useState(10);
  const [minSamplesLeaf, setMinSamplesLeaf] = useState(1); // Cambiado para coincidir con backend

  const handleRetrain = async () => {
    // Verificamos si ya se limpiaron los datos antes de permitir entrenar
    if (!isCleaned) {
        setError("No hay datos listos. Ve a 'Limpieza' primero.");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      // Preparamos la configuración tal cual la espera el backend (sin nesting)
      const config = {
        n_estimators: nEstimators,
        max_depth: maxDepth,
        min_samples_leaf: minSamplesLeaf,
      };

      // Usamos el servicio centralizado
      const data = await apiService.trainModel(config);

      // Actualizamos el contexto con los nuevos resultados
      setModelId("modelo_random_forest"); // Simulamos un ID
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
      <h1>⚙️ Ajuste de Hiperparámetros</h1>

      {!isCleaned && (
        <Card style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #f39c12' }}>
          <p>⚠️ No hay datos cargados o limpios. Por favor realiza la <strong>Carga Masiva</strong> y <strong>Limpieza</strong> primero.</p>
        </Card>
      )}

      <Card title="Configuración de Random Forest">
        <div style={styles.sliderContainer}>
          
          {/* SLIDER 1: Cantidad de Árboles */}
          <label style={styles.label}>
            Cantidad de árboles (n_estimators): <strong>{nEstimators}</strong>
            <input
              type="range"
              min="10"
              max="300"
              step="10"
              value={nEstimators}
              onChange={(e) => setNEstimators(Number(e.target.value))}
              style={styles.slider}
            />
          </label>

          {/* SLIDER 2: Profundidad */}
          <label style={styles.label}>
            Profundidad máxima (max_depth): <strong>{maxDepth}</strong>
            <input
              type="range"
              min="2"
              max="50"
              value={maxDepth}
              onChange={(e) => setMaxDepth(Number(e.target.value))}
              style={styles.slider}
            />
          </label>

          {/* SLIDER 3: Hojas*/}
          <label style={styles.label}>
            Mínimo de muestras por hoja (min_samples_leaf): <strong>{minSamplesLeaf}</strong>
            <input
              type="range"
              min="1"
              max="20"
              value={minSamplesLeaf}
              onChange={(e) => setMinSamplesLeaf(Number(e.target.value))}
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
  slider: { display: 'block', width: '100%', marginTop: '0.5rem', accentColor: '#e67e22' },
  button: { 
    padding: '0.75rem 2rem', 
    backgroundColor: '#e67e22', 
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