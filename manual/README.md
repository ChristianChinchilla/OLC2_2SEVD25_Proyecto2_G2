# Documentación Técnica y Académica: InsightCluster

## 1. Justificación del Enfoque y Modelo Seleccionado

### Enfoque: Aprendizaje Automático No Supervisado
Para el proyecto **InsightCluster**, se optó por un enfoque de aprendizaje no supervisado debido a la ausencia de una variable objetivo (*ground truth*). En el contexto empresarial real, etiquetar manualmente miles de reseñas o comportamientos de clientes es costoso y propenso a sesgos humanos.

El enfoque no supervisado permite realizar **Minería de Datos Exploratoria**. A diferencia de los modelos supervisados (como Random Forest usado anteriormente) que buscan minimizar un error de predicción, este enfoque busca maximizar la **cohesión interna** de los grupos y la **separación** entre ellos, revelando estructuras latentes en los datos que los analistas humanos podrían pasar por alto.

### Modelo Seleccionado: K-Means Clustering
Se seleccionó el algoritmo **K-Means** tras evaluar alternativas como *DBSCAN* y *Clustering Jerárquico*. La elección se justifica por:

1.  **Complejidad Computacional (Big O):** El Clustering Jerárquico tiene una complejidad aproximada de $O(n^3)$, lo cual lo hace inviable para conjuntos de datos masivos ("Carga Masiva"). K-Means, con una complejidad lineal de $O(n \cdot k \cdot i)$, es significativamente más eficiente y escalable para entornos de producción.
2.  **Geometría del Problema:** K-Means asume que los clústeres son convexos y esféricos, lo cual funciona adecuadamente para datos de comportamiento de clientes tras la normalización.
3.  **Interpretabilidad de Centroides:** El modelo genera "centroides" matemáticos. Esto permite al negocio definir un *Buyer Persona* basado en el promedio exacto de cada grupo (ej. "El centroide 1 tiene un gasto promedio de $500 y antigüedad de 2 años"), facilitando la traducción de matemáticas a estrategias de marketing.

---

## 2. Explicación del Preprocesamiento y Decisiones de Diseño

Dado que K-Means es un algoritmo basado en distancias (Distancia Euclidiana), es altamente sensible a la calidad y escala de los datos. Se diseñó un **Pipeline de Preprocesamiento** (`ClusterLogic`) riguroso:

### A. Ingeniería de Características (Feature Engineering)
Se derivó la variable **`longitud_reseña`** a partir del texto no estructurado.
*   *Justificación Académica:* La longitud del texto es un proxy del "compromiso" (*engagement*) del cliente. Estudios en análisis de sentimientos sugieren que las reseñas extremadamente largas suelen correlacionarse con experiencias muy positivas (evangelizadores de marca) o muy negativas (detractores), mientras que las cortas indican indiferencia. Esta variable numérica enriquece la segmentación.

### B. Limpieza e Imputación Estadística
*   **Detección de Formato:** Se implementó una lógica de *fallback* para leer archivos CSV separados por comas o punto y coma, aumentando la robustez del sistema ante diferentes configuraciones regionales.
*   **Imputación:** Para los valores numéricos faltantes, se utilizó la **media aritmética**. Se descartó la eliminación de filas (*dropping*) para no reducir el tamaño muestral, y se prefirió la media sobre la mediana para mantener la sensibilidad a los valores extremos que, en segmentación de clientes (como clientes "VIP" con gastos altos), son importantes de detectar.

### C. Normalización (Estandarización Z-Score)
Se aplicó `StandardScaler` ($\frac{x - \mu}{\sigma}$) a todas las variables numéricas.
*   *Fundamento Matemático:* K-Means calcula la distancia entre puntos. Sin estandarización, una variable como `monto_total` (rango 0-10,000) tendría un peso 1,000 veces mayor que `frecuencia_compra` (rango 1-10) en el cálculo de la distancia. La estandarización centra las variables en 0 con desviación estándar 1, garantizando la **isotropía** del espacio de características (todas las dimensiones aportan igual).

### D. Vectorización TF-IDF (NLP)
Para procesar las reseñas, se utilizó **TF-IDF** (Term Frequency-Inverse Document Frequency) en lugar de un simple conteo de palabras (Bag of Words).
*   *Justificación:* TF-IDF penaliza las palabras que aparecen en *todas* las reseñas (como "producto", "compra", "el") y resalta las palabras únicas que definen a un grupo específico (ej. "defectuoso", "excelente", "rápido").
*   *Reducción de Dimensionalidad:* Se limitó a `max_features=50` para evitar la "Maldición de la Dimensionalidad" (*Curse of Dimensionality*), donde el espacio se vuelve tan disperso que las distancias euclidianas pierden significado.

---

## 3. Justificación de los Hiperparámetros

El ajuste del modelo (`tuning`) es esencial para evitar soluciones subóptimas. Se seleccionaron los siguientes parámetros:

| Hiperparámetro | Valor Configurado | Justificación Técnica |
| :--- | :--- | :--- |
| **`n_clusters` (k)** | Dinámico (Usuario) | No existe un $k$ "verdadero" en aprendizaje no supervisado. Se permite al usuario modificar este valor basándose en el análisis de las métricas de **Inercia** (Método del Codo) y **Silueta**, buscando el equilibrio entre compresión de datos y precisión. |
| **`max_iter`** | 300 | Define el límite de reubicación de los centroides. Un valor de 300 es el estándar industrial de *Scikit-Learn*; es suficientemente alto para garantizar la convergencia (estabilidad) de los centroides en datasets complejos, pero previene bucles infinitos si los datos son muy ruidosos. |
| **`n_init`** | 10 | K-Means es un algoritmo no determinista; el resultado final depende de dónde se coloquen los centroides al inicio. Este parámetro ejecuta el algoritmo 10 veces con diferentes semillas aleatorias iniciales y retiene automáticamente el modelo con la menor inercia, mitigando el riesgo de caer en **óptimos locales**. |
| **`random_state`** | 42 | Se fijó una semilla para garantizar la **reproducibilidad** de los experimentos científicos y académicos presentados. |

---

## 4. Documentación Clara del Flujo y Herramientas

### Arquitectura del Sistema
El proyecto sigue una arquitectura **RESTful Cliente-Servidor** desacoplada:

1.  **Capa de Presentación (Frontend - React):**
    *   Encargada de la interfaz gráfica y la visualización de datos.
    *   No realiza cálculos matemáticos complejos, delegando esa carga al servidor.

2.  **Capa de Lógica de Negocio y ML (Backend - Python/FastAPI):**
    *   **FastAPI:** Seleccionado por su velocidad (basado en Starlette) y validación automática de tipos (Pydantic), superando a Flask en rendimiento.
    *   **Pandas/NumPy:** Utilizados para la manipulación matricial de datos en memoria.
    *   **Scikit-Learn:** Motor de inferencia para el clustering y cálculo de métricas.

### Flujo de Datos (Pipeline)
1.  **Ingesta:** El archivo CSV se recibe como *stream* de bytes, se convierte a DataFrame y se almacena en memoria volátil para la sesión actual.
2.  **Transformación (ETL):** Se ejecuta el `ColumnTransformer` que bifurca el proceso: los datos numéricos van al escalador y los textos al vectorizador TF-IDF. Luego, se concatenan en una sola matriz densa/dispersa.
3.  **Modelado:** Se instancia la clase `KMeans` y se invoca el método `.fit_predict()`, generando el vector de etiquetas (`labels`).
4.  **Validación:** Se calculan las métricas internas (Silueta, Calinski, Davies-Bouldin) comparando las distancias entre los puntos y sus centroides asignados versus los centroides vecinos.
5.  **Serialización:** Los resultados se estructuran en JSON para el reporte visual y en CSV para la descarga física.

---

## 5. Conclusiones y Lecciones Aprendidas

### Conclusiones
*   **Sinergia Numérico-Textual:** La integración de variables conductuales (RFM - Recencia, Frecuencia, Monto) con variables no estructuradas (Texto) mediante un pipeline unificado demostró ser superior a usar solo una fuente de datos. Esto permite identificar clústeres semánticos (ej. "Clientes insatisfechos por envíos") dentro de segmentos financieros.
*   **Validación sin Etiquetas:** Se concluye que el **Coeficiente de Silueta** es la métrica más confiable para este dominio, ya que penaliza tanto la superposición de clústeres como la dispersión excesiva, ofreciendo una medida de calidad interpretable entre -1 y 1.

### Lecciones Aprendidas
1.  **El Impacto de la Escala:** En iteraciones tempranas, omitir la normalización provocó que el algoritmo agrupara exclusivamente por `monto_total_gastado`. Se aprendió que en algoritmos de distancia, la variable con mayor magnitud dicta la estructura del clúster si no se estandariza.
2.  **Interpretabilidad vs. Complejidad:** Aunque algoritmos de densidad como DBSCAN pueden manejar formas arbitrarias, se aprendió que K-Means es preferible en contextos de negocio porque los clientes necesitan entender el "promedio" del grupo (el centroide), concepto que DBSCAN no ofrece directamente.
3.  **Gestión de Ruido en Texto:** Se identificó que sin una limpieza adecuada de *stopwords* y limitación de *features*, la matriz TF-IDF introducía demasiado ruido, fragmentando los clústeres innecesariamente. La curación de datos es tan importante como el algoritmo.