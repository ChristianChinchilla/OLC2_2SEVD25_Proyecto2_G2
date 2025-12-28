import React, { useState, useEffect } from 'react';
import clusterData from '../data/clusterData.json';
import SimpleBarChart from '../components/SimpleBarChart';

export default function Insights() {
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    setClusters(clusterData.clusters);
  }, []);

  return (
    <div style={styles.container}>

      {/* ================== HERO ================== */}
      <div style={styles.hero}>
        <h1 style={styles.title}>
          Interpretación del Modelo de Segmentación
        </h1>
        <p style={styles.text}>
          Esta vista te guía paso a paso para comprender cómo el sistema analiza los datos,
          genera segmentos y cómo interpretar correctamente los resultados obtenidos.
        </p>
      </div>

      {/* ================== PROPÓSITO ================== */}
      <div style={styles.card}>
        <h2 style={styles.subtitle}>
          ¿Para qué existe esta herramienta?
        </h2>
        <p style={styles.text}>
          El objetivo del sistema es transformar datos complejos en conocimiento útil.
          A través de técnicas de <strong>Machine Learning no supervisado</strong>, se identifican
          patrones de comportamiento en clientes sin necesidad de etiquetas previas.
        </p>
      </div>

      {/* ================== FLUJO K-MEANS ================== */}
      <div style={styles.card}>
        <h2 style={styles.subtitle}>
          ¿Cómo trabaja el modelo internamente?
        </h2>

        <div style={styles.flow}>
          <div style={styles.node}>CSV</div>
          <span style={styles.arrow}>→</span>
          <div style={styles.node}>Limpieza</div>
          <span style={styles.arrow}>→</span>
          <div style={styles.node}>Normalización</div>
          <span style={styles.arrow}>→</span>
          <div style={styles.node}>K-Means</div>
          <span style={styles.arrow}>→</span>
          <div style={styles.node}>Clusters</div>
        </div>

        <p style={styles.note}>
          Este flujo representa conceptualmente cómo los datos avanzan dentro del sistema
          hasta convertirse en segmentos interpretables.
        </p>
      </div>

      {/* ================== MÉTRICAS ================== */}
      <div style={styles.card}>
        <h2 style={styles.subtitle}>
          ¿Cómo se evalúa el modelo?
        </h2>

        <div style={styles.metricsGrid}>
          <Metric
            title="Inercia"
            text="Mide qué tan compactos son los clusters. Se utiliza únicamente para comparar configuraciones con diferente número de segmentos."
          />
          <Metric
            title="Silhouette"
            text="Evalúa qué tan bien separados están los clusters. Valores más altos indican una mejor estructura del agrupamiento."
          />
          <Metric
            title="Calinski-Harabasz"
            text="Relaciona la separación entre clusters con la cohesión interna. Valores altos indican un buen equilibrio."
          />
          <Metric
            title="Davies-Bouldin"
            text="Mide la similitud entre clusters. Valores bajos indican que los segmentos están mejor diferenciados."
          />
        </div>
      </div>

      {/* ================== VISUALIZACIÓN ================== */}
      <div style={styles.card}>
        <h2 style={styles.subtitle}>
          Distribución de Clientes por Segmento
        </h2>

        <p style={styles.text}>
          Esta gráfica muestra cómo el modelo distribuyó a los clientes en cada segmento.
          Permite detectar clusters dominantes, desbalanceados o poco representativos.
        </p>

        <SimpleBarChart
          data={clusters.map(c => ({
            label: c.nombre,
            value: c.cantidad_clientes
          }))}
        />

        <p style={styles.note}>
          Un buen agrupamiento no necesariamente tiene segmentos del mismo tamaño,
          sino segmentos con significado interpretativo.
        </p>
      </div>

    </div>
  );
}

/* ================== COMPONENTE MÉTRICA ================== */
function Metric({ title, text }) {
  return (
    <div style={styles.metricBox}>
      <h4 style={styles.metricTitle}>{title}</h4>
      <p style={styles.metricText}>{text}</p>
    </div>
  );
}

/* ================== ESTILOS ================== */
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    color: '#2c3e50'
  },
  hero: {
    textAlign: 'center',
    marginBottom: '3rem'
  },
  title: {
    color: '#2c3e50',
    marginBottom: '1rem'
  },
  subtitle: {
    color: '#2c3e50',
    marginBottom: '1rem'
  },
  text: {
    color: '#2c3e50',
    lineHeight: '1.7'
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
    marginBottom: '2.5rem'
  },
  flow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    margin: '1.5rem 0'
  },
  node: {
    padding: '0.7rem 1.2rem',
    backgroundColor: '#2c3e50',
    color: '#ffffff',
    borderRadius: '6px',
    fontSize: '0.9rem'
  },
  arrow: {
    color: '#2c3e50',
    fontSize: '1.2rem'
  },
  note: {
    fontSize: '0.9rem',
    color: '#555',
    marginTop: '1rem'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem'
  },
  metricBox: {
    backgroundColor: '#f8f9fa',
    padding: '1.2rem',
    borderRadius: '6px'
  },
  metricTitle: {
    color: '#2c3e50',
    marginBottom: '0.5rem'
  },
  metricText: {
    color: '#2c3e50',
    lineHeight: '1.6'
  }
};
