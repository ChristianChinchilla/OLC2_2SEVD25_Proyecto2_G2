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
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '2rem', textAlign: 'center' }}>Exportación de Reportes</h1>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* Sección Clientes */}
        <div style={styles.card}>
          <div style={styles.header}>
            <h2 style={{ margin: 0 }}>Reporte de Clientes Segmentados</h2>
            <button 
              onClick={() => downloadCSV(clientes, 'clientes_segmentados.csv')}
              style={styles.button}
            >
              Descargar CSV
            </button>
          </div>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID Cliente</th>
                  <th>Nombre</th>
                  <th>Cluster</th>
                  <th>Segmento</th>
                </tr>
              </thead>
              <tbody>
                {clientes.slice(0, 5).map((c, i) => (
                  <tr key={i}>
                    <td>{c.ID_Cliente}</td>
                    <td>{c.Nombre}</td>
                    <td>{c.ID_Cluster}</td>
                    <td>{c.Nombre_Cluster}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ textAlign: 'center', color: '#666', marginTop: '1rem' }}>
              * Mostrando primeros 5 registros de {clientes.length}
            </p>
          </div>
        </div>

        {/* Sección Resumen */}
        <div style={styles.card}>
          <div style={styles.header}>
            <h2 style={{ margin: 0 }}>Resumen de Clusters</h2>
            <button 
              onClick={() => downloadCSV(resumen, 'resumen_clusters.csv')}
              style={styles.button}
            >
              Descargar CSV
            </button>
          </div>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Clientes</th>
                  <th>Gasto Prom.</th>
                  <th>Satisfacción</th>
                </tr>
              </thead>
              <tbody>
                {resumen.map((r, i) => (
                  <tr key={i}>
                    <td>{r.ID_Cluster}</td>
                    <td>{r.Nombre}</td>
                    <td>{r.Clientes}</td>
                    <td>${r.Gasto_Promedio}</td>
                    <td>{r.Satisfaccion}/5</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  button: {
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.9rem'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '600px'
  }
};
