import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import apiService from '../services/apiService';

export default function Predict() {
  const { canPredict, modelId } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const [formData, setFormData] = useState({
    promedio_actual: '',
    asistencia_clases: '',
    tareas_entregadas: '',
    participacion_clase: '',
    horas_estudio: '',
    promedio_evaluaciones: '',
    cursos_reprobados: '',
    actividades_extracurriculares: '',
    reportes_disciplinarios: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convertir valores de string a números
      const studentData = {
        promedio_actual: parseFloat(formData.promedio_actual),
        asistencia_clases: parseFloat(formData.asistencia_clases),
        tareas_entregadas: parseFloat(formData.tareas_entregadas),
        participacion_clase: parseInt(formData.participacion_clase),
        horas_estudio: parseFloat(formData.horas_estudio),
        promedio_evaluaciones: parseFloat(formData.promedio_evaluaciones),
        cursos_reprobados: parseInt(formData.cursos_reprobados),
        actividades_extracurriculares: parseInt(formData.actividades_extracurriculares),
        reportes_disciplinarios: parseInt(formData.reportes_disciplinarios),
      };

      const data = await apiService.predictStudent(studentData);
      
      setPrediction({
        risk: data.interpretation,
        prediction: data.prediction,
        message: data.interpretation,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      promedio_actual: '',
      asistencia_clases: '',
      tareas_entregadas: '',
      participacion_clase: '',
      horas_estudio: '',
      promedio_evaluaciones: '',
      cursos_reprobados: '',
      actividades_extracurriculares: '',
      reportes_disciplinarios: '',
    });
    setPrediction(null);
    setError(null);
  };

  const fields = [
    { name: 'promedio_actual', label: 'Promedio Actual' },
    { name: 'asistencia_clases', label: 'Asistencia a Clases (%)' },
    { name: 'tareas_entregadas', label: 'Tareas Entregadas (%)' },
    { name: 'participacion_clase', label: 'Participación en Clase' },
    { name: 'horas_estudio', label: 'Horas de Estudio Semanales' },
    { name: 'promedio_evaluaciones', label: 'Promedio de Evaluaciones' },
    { name: 'cursos_reprobados', label: 'Cursos Reprobados' },
    { name: 'actividades_extracurriculares', label: 'Actividades Extracurriculares' },
    { name: 'reportes_disciplinarios', label: 'Reportes Disciplinarios' },
  ];

  return (
    <div style={styles.container}>
      <h1>🔮 Predicción Individual</h1>

      {!canPredict && (
        <Card style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #f39c12' }}>
          <p>⚠️ El modelo debe estar entrenado con métricas adecuadas antes de realizar predicciones.</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Métricas requeridas: Accuracy &gt; 75%, Precision, Recall y F1 &gt; 70%</p>
        </Card>
      )}

      <Card title="Datos del Estudiante">
        <form onSubmit={handlePredict} style={styles.form}>
          <div style={styles.grid}>
            {fields.map((field) => (
              <label key={field.name} style={styles.label}>
                {field.label}:
                <input
                  type="number"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                  step="0.01"
                  style={styles.input}
                />
              </label>
            ))}
          </div>

          <div style={styles.buttonContainer}>
            <button type="submit" disabled={loading} style={styles.buttonPredict}>
              {loading ? 'Prediciendo...' : 'Predecir'}
            </button>
            <button type="button" onClick={handleClear} style={styles.buttonClear}>
              Limpiar
            </button>
          </div>

          {error && <p style={styles.error}>❌ {error}</p>}
        </form>
      </Card>

      {prediction && (
        <Card title="Resultado de la Predicción" style={styles.resultCard}>
          <div style={styles.result}>
            <h2 style={prediction.risk.includes('Alto') || prediction.risk.includes('Riesgo') ? styles.riskHigh : styles.riskLow}>
              {prediction.risk}
            </h2>
            <p style={styles.message}>{prediction.message}</p>
          </div>
        </Card>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' },
  form: { width: '100%' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  label: { display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' },
  input: { display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.25rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ddd' },
  buttonContainer: { display: 'flex', gap: '1rem', marginTop: '1rem' },
  buttonPredict: { padding: '0.75rem 2rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' },
  buttonClear: { padding: '0.75rem 2rem', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' },
  error: { color: '#e74c3c', marginTop: '1rem' },
  warning: { color: '#f39c12', fontWeight: 'bold' },
  resultCard: { borderTop: '4px solid #2ecc71' },
  result: { textAlign: 'center' },
  riskHigh: { color: '#e74c3c', fontSize: '2rem', margin: '1rem 0' },
  riskLow: { color: '#27ae60', fontSize: '2rem', margin: '1rem 0' },
  message: { marginTop: '1rem', fontSize: '1.1rem', color: '#34495e' },
};
