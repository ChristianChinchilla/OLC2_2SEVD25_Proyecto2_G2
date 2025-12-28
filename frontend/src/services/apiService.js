import { getApiUrl, API_ENDPOINTS } from '../config';

/**
 * Servicio centralizado para todas las llamadas al backend
 */
const apiService = {
  /**
   * Verificar que el backend esté disponible
   */
  async checkHealth() {
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.ROOT));
      if (!response.ok) throw new Error('Backend no disponible');
      return await response.json();
    } catch (error) {
      console.error('Error al conectar con el backend:', error);
      throw error;
    }
  },

  /**
   * Subir archivo CSV al backend
   * @param {File} file - Archivo CSV a subir
   * @returns {Promise<Object>} Respuesta con estado y datos del dataset
   */
  async uploadCSV(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(getApiUrl(API_ENDPOINTS.UPLOAD_CSV), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al subir archivo');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en uploadCSV:', error);
      throw error;
    }
  },

   /**
   * Ejecutar limpieza de datos en el backend
   */
  async cleanData() {
    try {
      // Nota: Es POST pero sin body, porque el backend ya tiene los datos en memoria
      const response = await fetch(getApiUrl(API_ENDPOINTS.CLEAN_DATA), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al limpiar datos');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en cleanData:', error);
      throw error;
    }
  },

  /**
   * Entrenar el modelo con hiperparámetros opcionales
   * @param {Object} config - Configuración del entrenamiento
   * @param {number} config.n_estimators - Número de árboles (default: 100)
   * @param {number} config.max_depth - Profundidad máxima (default: null)
   * @param {number} config.min_samples_leaf - Mínimo de muestras por hoja (default: 1)
   * @returns {Promise<Object>} Métricas del modelo entrenado
   */
  async trainModel(config = {}) {
    try {
      const defaultConfig = {
        n_estimators: 100,
        max_depth: null,
        min_samples_leaf: 1,
      };

      const requestBody = { ...defaultConfig, ...config };

      const response = await fetch(getApiUrl(API_ENDPOINTS.TRAIN_MODEL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al entrenar modelo');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en trainModel:', error);
      throw error;
    }
  },

  /**
   * Obtener métricas actuales del modelo
   * @returns {Promise<Object>} Métricas del modelo
   */
  async getMetrics() {
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.GET_METRICS));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al obtener métricas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getMetrics:', error);
      throw error;
    }
  },

  /**
   * Realizar predicción individual para un estudiante
   * @param {Object} studentData - Datos del estudiante
   * @returns {Promise<Object>} Resultado de la predicción
   */
  async getSegmentsReport() {
    const response = await fetch('/segments-report');
    if (!response.ok) throw new Error('Error al obtener segmentos');
    return await response.json();
  },

  /**
   * Sugerir el mejor número de clusters usando Silhouette
   * @param {number} min_k - Mínimo número de clusters a probar
   * @param {number} max_k - Máximo número de clusters a probar
   * @returns {Promise<Object>} { best_k, best_score, silhouette_scores }
   */
  async findBestK(min_k = 2, max_k = 10) {
    const url = getApiUrl(API_ENDPOINTS.FIND_BEST_K || '/find-best-k');
    const params = `?min_k=${min_k}&max_k=${max_k}`;
    const response = await fetch(url + params);
    if (!response.ok) throw new Error('Error al buscar el mejor número de clusters');
    return await response.json();
  },
};

export default apiService;
