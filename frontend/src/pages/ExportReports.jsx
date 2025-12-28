import React, { useState, useEffect } from 'react';
import clusterData from '../data/clusterData.json';
// Debes instalar jsPDF y jspdf-autotable: npm install jspdf jspdf-autotable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ExportReports() {
  const [clientes, setClientes] = useState([]);
  const [resumen, setResumen] = useState([]);
  const [generating, setGenerating] = useState(false);

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

  // Utilidad para cargar imagen y convertirla a base64
  const getImageBase64 = (url) => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  // Generar PDF con imágenes y tablas
  const handleDownloadPDF = async () => {
    setGenerating(true);
    const doc = new jsPDF('p', 'mm', 'a4');
    let y = 15;

    doc.setFontSize(18);
    doc.text('Reporte de Segmentación para uso de análisis y presentación', 105, y, { align: 'center' });
    y += 10;

    doc.setFontSize(12);
    doc.text('Resumen de Clusters', 15, y);
    y += 5;

    // Tabla de resumen de clusters
    autoTable(doc, {
      startY: y,
      head: [['ID Cluster', 'Nombre', 'Clientes', 'Gasto Promedio', 'Satisfacción']],
      body: resumen.map(r => [
        r.ID_Cluster,
        r.Nombre,
        r.Clientes,
        r.Gasto_Promedio,
        r.Satisfaccion
      ]),
      theme: 'grid',
      headStyles: { fillColor: [44, 62, 80] },
      styles: { fontSize: 10 },
      margin: { left: 15, right: 15 }
    });
    y = doc.lastAutoTable.finalY + 10;

    // Imágenes a incluir (deben estar disponibles en backend)
    const images = [
      {
        title: 'Distribución de Clientes por Segmento',
        url: 'http://localhost:8000/reports/clientes_por_segmento.png'
      },
      {
        title: 'Promedio de Gasto por Segmento',
        url: 'http://localhost:8000/reports/gasto_promedio_por_segmento.png'
      },
      {
        title: 'Frecuencia Promedio de Compra',
        url: 'http://localhost:8000/reports/frecuencia_vs_gasto.png'
      },
      {
        title: 'Canal Principal por Segmento',
        url: 'http://localhost:8000/reports/canales_por_segmento.png'
      }
    ];

    for (const imgObj of images) {
    if (y > 220) {
      doc.addPage();
      y = 15;
    }
    doc.setFontSize(13);
    doc.text(imgObj.title, 15, y);
    y += 5;

    const imgData = await getImageBase64(imgObj.url);
    if (imgData) {
      // Crear un objeto Image para obtener dimensiones reales
      const tempImg = new window.Image();
      tempImg.src = imgData;
      await new Promise(res => { tempImg.onload = res; });

      // Calcular tamaño manteniendo proporción
      const maxWidth = 180;
      const maxHeight = 90;
      let imgWidth = tempImg.width;
      let imgHeight = tempImg.height;
      if (imgWidth > maxWidth) {
        imgHeight = imgHeight * (maxWidth / imgWidth);
        imgWidth = maxWidth;
      }
      if (imgHeight > maxHeight) {
        imgWidth = imgWidth * (maxHeight / imgHeight);
        imgHeight = maxHeight;
      }

      doc.addImage(imgData, 'PNG', 15, y, imgWidth, imgHeight, undefined, 'FAST');
      y += imgHeight + 10;
    } else {
      doc.setFontSize(11);
      doc.text('Imagen no disponible', 15, y + 10);
      y += 15;
    }
  }

    // Descargar el PDF
    doc.save('Reporte_Segmentacion.pdf');
    setGenerating(false);
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
        {/* Recuadro 3: PDF */}
        <div style={styles.exportCard}>
          <div style={styles.exportContent}>
            <div style={styles.exportDescription}>
              <h3 style={{margin: 0}}>PDF con Reportes generados</h3>
              <p style={styles.descText}>Descarga del PDF con los Reportes generados</p>
            </div>
            <div style={styles.buttonGroup}>
              <button
                style={styles.pdfButton}
                onClick={handleDownloadPDF}
                disabled={generating}
              >
                {generating ? 'Generando PDF...' : 'Descargar Reporte PDF'}
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