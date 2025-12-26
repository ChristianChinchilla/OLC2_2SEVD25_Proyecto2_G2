import React, { useState, useEffect } from 'react';
import clusterData from '../data/clusterData.json';
import SimpleBarChart from '../components/SimpleBarChart';

export default function Insights() {
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    setClusters(clusterData.clusters);
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '2rem', textAlign: 'center' }}>Interpretación y Perfilado de Segmentos</h1>

      {/* Tabla Resumen */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Resumen de Clusters</h2>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre del Segmento</th>
                <th>Clientes</th>
                <th>Gasto Promedio</th>
                <th>Satisfacción</th>
              </tr>
            </thead>
            <tbody>
              {clusters.map(c => (
                <tr key={c.cluster_id}>
                  <td>{c.cluster_id}</td>
                  <td>{c.nombre}</td>
                  <td>{c.cantidad_clientes}</td>
                  <td>${c.metricas_promedio.gasto_promedio}</td>
                  <td>{c.metricas_promedio.satisfaccion}/5</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfica */}
      <div style={styles.section}>
        <SimpleBarChart 
          data={clusters.map(c => ({ label: c.nombre, value: c.cantidad_clientes }))} 
        />
      </div>

      {/* Tarjetas de Perfil */}
      <div style={styles.cardsGrid}>
        {clusters.map(c => (
          <div key={c.cluster_id} style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={{ margin: 0, color: 'white' }}>{c.nombre}</h3>
            </div>
            <div style={styles.cardBody}>
              <h4 style={styles.cardSubtitle}>Características Clave</h4>
              <ul style={styles.list}>
                {c.caracteristicas_clave.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              
              <h4 style={styles.cardSubtitle}>Análisis de Reseñas</h4>
              <p style={styles.text}>{c.resumen_reseñas}</p>
              
              <div style={styles.metrics}>
                <div style={styles.metric}>
                  <span>Frecuencia Compra:</span>
                  <strong>{c.metricas_promedio.frecuencia_compra}x/mes</strong>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  section: {
    marginBottom: '3rem'
  },
  sectionTitle: {
    color: '#34495e',
    marginBottom: '1rem',
    borderBottom: '2px solid #ecf0f1',
    paddingBottom: '0.5rem'
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
    display: 'flex',
    flexDirection: 'column'
  },
  cardHeader: {
    backgroundColor: '#2c3e50',
    padding: '1rem',
    textAlign: 'center'
  },
  cardBody: {
    padding: '1.5rem',
    flex: 1
  },
  cardSubtitle: {
    color: '#7f8c8d',
    marginBottom: '0.5rem',
    marginTop: '1rem',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  list: {
    paddingLeft: '1.2rem',
    margin: 0,
    color: '#2c3e50'
  },
  text: {
    color: '#34495e',
    lineHeight: '1.5',
    margin: 0
  },
  metrics: {
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #ecf0f1',
    display: 'flex',
    justifyContent: 'space-between'
  },
  metric: {
    fontSize: '0.9rem',
    color: '#7f8c8d',
    display: 'flex',
    flexDirection: 'column'
  }
};

