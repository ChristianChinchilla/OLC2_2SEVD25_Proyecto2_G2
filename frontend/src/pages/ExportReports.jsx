import React, { useState, useEffect } from 'react';
import clusterData from '../data/clusterData.json';

export default function ExportReports() {
  const [clientes, setClientes] = useState([]);
  const [resumen, setResumen] = useState([]);

  useEffect(() => {
    // Preparar datos de clientes
    const clientesProcesados = clusterData.clientes_segmentados.map(cliente => {
      const cluster = clusterData.clusters.find(c => c.cluster_id === cliente.cluster_id);
      return {
        ID_Cliente: cliente.cliente_id,
        Nombre: cliente.nombre,
        ID_Cluster: cliente.cluster_id,
        Nombre_Cluster: cluster ? cluster.nombre : 'Desconocido'
      };
    });
    setClientes(clientesProcesados);

    // Preparar datos de resumen
    const resumenProcesado = clusterData.clusters.map(c => ({
      ID_Cluster: c.cluster_id,
      Nombre: c.nombre,
      Clientes: c.cantidad_clientes,
      Gasto_Promedio: c.metricas_promedio.gasto_promedio,
      Satisfaccion: c.metricas_promedio.satisfaccion
    }));
    setResumen(resumenProcesado);
  }, []);

  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(fieldName => JSON.stringify(row[fieldName])).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`Archivo ${filename} descargado con éxito.`);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Exportación de Reportes</h1>
      <div style={styles.grid}>
        {/* Recuadro 1: Clientes Segmentados */}
        <div style={styles.exportCard}>
          <div style={styles.exportContent}>
            <div style={styles.exportDescription}>
              <h3 style={{margin: 0}}>Clientes Segmentados</h3>
              <p style={styles.descText}>Descarga del archivo CSV de clientes segmentados</p>
            </div>
            <div style={styles.buttonGroup}>
              <button
                onClick={() => downloadCSV(clientes, 'clientes_segmentados.csv')}
                style={styles.csvButton}
              >
                Descargar CSV
              </button>
            </div>
          </div>
        </div>
        {/* Recuadro 2: Resumen de Clusters */}
        <div style={styles.exportCard}>
          <div style={styles.exportContent}>
            <div style={styles.exportDescription}>
              <h3 style={{margin: 0}}>Resumen de Clusters</h3>
              <p style={styles.descText}>Descarga del archivo CSV con el resumen de clusters</p>
            </div>
            <div style={styles.buttonGroup}>
              <button
                onClick={() => downloadCSV(resumen, 'resumen_clusters.csv')}
                style={styles.csvButton}
              >
                Descargar CSV
              </button>
            </div>
          </div>
        </div>
        {/* Recuadro 3: Personalizado o futuro uso */}
        <div style={styles.exportCard}>
          <div style={styles.exportContent}>
            <div style={styles.exportDescription}>
              <h3 style={{margin: 0}}>PDF con Reportes generados</h3>
              <p style={styles.descText}>Descarga del PDF con los Reportes generados</p>
            </div>
            <div style={styles.buttonGroup}>
              <button
                style={styles.pdfButton}
                disabled
              >
                Descargar Reporte PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  title: { color: '#2c3e50', marginBottom: '2rem', textAlign: 'center' },
  grid: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  exportCard: {
    flex: '1 1 300px',
    minWidth: '320px',
    maxWidth: '370px',
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '2rem 1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  exportContent: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.5rem'
  },
  exportDescription: {
    textAlign: 'center'
  },
  descText: {
    color: '#666',
    fontSize: '1rem',
    margin: '0.5rem 0 0 0'
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    width: '100%',
    justifyContent: 'center'
  },
  csvButton: {
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '0.8rem 1.2rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    minWidth: '140px'
  },
  pdfButton: {
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    padding: '0.8rem 1.2rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    minWidth: '180px'
  }
};