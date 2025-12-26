import { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import apiService from '../services/apiService';

export default function Upload() {
  // Estados del archivo
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  // Estados de Flujo (Semáforo para habilitar botones)
  const [isUploaded, setIsUploaded] = useState(false);
  const [isCleanedLocal, setIsCleanedLocal] = useState(false);
  const [isTrained, setIsTrained] = useState(false);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Contexto Global
  const { 
    setDatasetId, setDatasetInfo, 
    setIsCleaned, setCleaningResults, 
    setModelId, setMetrics, checkMetrics 
  } = useAppContext();

  // --- 1. SELECCIÓN DE ARCHIVO ---
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setError(null);
      // Resetear flujo si cambia el archivo
      setIsUploaded(false);
      setIsCleanedLocal(false);
      setIsTrained(false);
      setStatusMessage('');
    } else if (selectedFile) {
      setError('Solo se permiten archivos .csv');
      setFile(null);
    }
  };

  const handleButtonClick = () => fileInputRef.current?.click();

  // --- 2. SUBIR (Backend: Carga Raw) ---
  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setStatusMessage('Subiendo archivo al servidor...');

    try {
      const data = await apiService.uploadCSV(file);
      
      setDatasetId(file.name);
      setDatasetInfo({
        filename: file.name,
        rows: data.rows,
        message: data.message,
      });

      setIsUploaded(true); // Habilita siguiente paso
      setStatusMessage('✅ Archivo cargado. Ahora debes limpiarlo.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. LIMPIAR (Backend: Clean Data) ---
  const handleClean = async () => {
    setLoading(true);
    setError(null);
    setStatusMessage('Limpiando y normalizando datos...');

    try {
      const data = await apiService.cleanData();
      
      setCleaningResults(data);
      setIsCleaned(true); // Actualiza contexto global
      
      setIsCleanedLocal(true); // Habilita siguiente paso
      setStatusMessage('✅ Datos limpios. Listos para entrenamiento.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 4. ENTRENAR (Backend: Train Model) ---
  const handleTrain = async () => {
    setLoading(true);
    setError(null);
    setStatusMessage('Entrenando modelo inicial (Random Forest)...');

    try {
      const data = await apiService.trainModel(); // Sin config = usa defaults
      
      setModelId("modelo_base");
      setMetrics(data.metrics);
      checkMetrics(data.metrics);
      
      setIsTrained(true);
      setStatusMessage('🚀 Modelo entrenado exitosamente. Ve a "Evaluación" para ver detalles.');
      alert('¡Entrenamiento completado! Revisa la pestaña de Evaluación.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>⚙️ Gestión del Modelo</h1>
      
      <div style={styles.grid}>
        
        {/* COLUMNA IZQUIERDA: CARGA DE ARCHIVO (Diseño anterior) */}
        <div style={styles.leftCol}>
          <Card title="1. Carga de Datos">
            <div style={styles.dropzone}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={styles.hiddenInput}
              />
              <button 
                type="button"
                onClick={handleButtonClick} 
                style={styles.selectButton}
              >
                📂 Seleccionar CSV
              </button>
              
              {file && (
                <div style={styles.fileInfo}>
                  <p>📄 <strong>{file.name}</strong></p>
                  <p style={styles.fileSize}>{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || loading || isUploaded}
              style={{
                ...styles.mainButton,
                ...((!file || loading || isUploaded) ? styles.buttonDisabled : {})
              }}
            >
              {isUploaded ? 'Cargado ✅' : (loading ? 'Subiendo...' : 'Subir Archivo')}
            </button>
          </Card>
        </div>

        {/* COLUMNA DERECHA: ACCIONES DEL PROCESO */}
        <div style={styles.rightCol}>
          <Card title="2. Procesamiento">
            <div style={styles.actionContainer}>
              
              {/* Botón Limpiar */}
              <button
                onClick={handleClean}
                disabled={!isUploaded || isCleanedLocal || loading}
                style={{
                  ...styles.actionButton,
                  ...(!isUploaded || isCleanedLocal ? styles.buttonDisabled : styles.darkButton)
                }}
              >
                {isCleanedLocal ? 'Datos Limpios ✅' : 'Limpiar Datos'}
              </button>

              {/* Botón Entrenar */}
              <button
                onClick={handleTrain}
                disabled={!isCleanedLocal || loading}
                style={{
                  ...styles.actionButton,
                  ...(!isCleanedLocal ? styles.buttonDisabled : styles.darkButton)
                }}
              >
                {loading && isCleanedLocal && !isTrained ? 'Entrenando...' : 'Entrenar Modelo'}
              </button>

              {/* Mensajes de Estado */}
              <div style={styles.statusBox}>
                {error && <p style={styles.error}>❌ {error}</p>}
                {statusMessage && <p style={styles.status}>ℹ️ {statusMessage}</p>}
              </div>

            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  grid: { display: 'flex', gap: '2rem', flexWrap: 'wrap' },
  leftCol: { flex: 1, minWidth: '300px' },
  rightCol: { flex: 1, minWidth: '300px' },
  
  // Estilos del Dropzone (Diseño Viejo)
  dropzone: { 
    border: '2px dashed #3498db', 
    padding: '2rem', 
    borderRadius: '8px', 
    textAlign: 'center', 
    marginBottom: '1rem',
    backgroundColor: '#f8f9fa'
  },
  hiddenInput: { display: 'none' },
  selectButton: {
    padding: '0.8rem 1.5rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  fileInfo: { marginTop: '1rem', backgroundColor: '#e8f4fd', padding: '0.5rem', borderRadius: '4px' },
  fileSize: { fontSize: '0.8rem', color: '#666' },

  // Botón Principal de Subida
  mainButton: { 
    width: '100%',
    padding: '0.75rem', 
    backgroundColor: '#27ae60', 
    color: 'white', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    fontSize: '1rem'
  },

  // Estilos de Acciones
  actionContainer: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  actionButton: {
    padding: '1rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  darkButton: { backgroundColor: '#34495e' }, // Gris oscuro estilo PDF
  buttonDisabled: { backgroundColor: '#bdc3c7', cursor: 'not-allowed', color: '#7f8c8d' },

  // Estado
  statusBox: { minHeight: '60px', marginTop: '1rem', padding: '0.5rem', borderRadius: '4px', backgroundColor: '#fdfdfd' },
  error: { color: '#e74c3c', fontWeight: 'bold' },
  status: { color: '#2980b9', fontWeight: '500' },
};