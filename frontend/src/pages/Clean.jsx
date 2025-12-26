import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import apiService from '../services/apiService'; // Importamos el servicio real

export default function Clean() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { datasetId, setIsCleaned, cleaningResults, setCleaningResults } = useAppContext();

  const handleClean = async () => {
    if (!datasetId) {
      setError("Primero debes subir un archivo en 'Carga Masiva'.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // LLAMADA REAL AL BACKEND
      const data = await apiService.cleanData();
      
      setCleaningResults(data);
      setIsCleaned(true); // Habilita la pestaña de Entrenar
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>🧹 Limpieza de Datos</h1>

      <Card title="Ejecutar Limpieza">
        <p>Este proceso enviará la orden al servidor para limpiar los datos crudos cargados previamente.</p>
        <button onClick={handleClean} disabled={loading} style={styles.button}>
          {loading ? 'Procesando en servidor...' : 'Ejecutar Limpieza Real'}
        </button>
        {error && <p style={styles.error}>❌ {error}</p>}
      </Card>

      {cleaningResults && (
        <Card title="Resultados del Backend">
          <p><strong>Filas finales:</strong> {cleaningResults.rows_processed}</p>
          <p><strong>Correcciones:</strong> {cleaningResults.missing_values_fixed}</p>
          <p><strong>Normalizaciones:</strong> {cleaningResults.normalizations}</p>
          <p style={styles.success}>✅ {cleaningResults.message}</p>
        </Card>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '800px', margin: '0 auto' },
  button: { padding: '0.75rem 2rem', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', marginTop: '1rem' },
  error: { color: '#e74c3c', marginTop: '1rem' },
  success: { color: '#27ae60', fontWeight: 'bold', marginTop: '1rem' },
};