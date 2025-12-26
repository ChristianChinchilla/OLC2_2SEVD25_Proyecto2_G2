import React from 'react';

export default function SimpleBarChart({ data }) {
  const maxVal = Math.max(...data.map(d => d.value));

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Distribución de Clientes por Cluster</h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '20px', paddingBottom: '20px', borderBottom: '1px solid #ccc' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
            <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              <div 
                style={{ 
                  width: '60%', 
                  height: `${(d.value / maxVal) * 100}%`, 
                  backgroundColor: '#3498db', 
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.5s ease'
                }} 
                title={`${d.label}: ${d.value}`}
              />
            </div>
            <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {d.label}
              <div style={{ color: '#666', fontWeight: 'normal' }}>{d.value} clientes</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
