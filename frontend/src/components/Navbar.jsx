import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function Navbar() {
  const location = useLocation();
  const { datasetId, isCleaned, modelId, canPredict } = useAppContext();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/upload', label: 'Carga Masiva', enabled: true },
    { path: '/metrics', label: 'Evaluación', enabled: true },
    { path: '/tune', label: 'Ajuste', enabled: true },
    { path: '/predict', label: 'Predicción', enabled: true },
    { path: '/insights', label: 'Interpretación', enabled: true },
    { path: '/export-reports', label: 'Exportar', enabled: true },
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <h2>InsightCluster</h2>
      </div>
      <div style={styles.links}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...styles.link,
              ...(isActive(item.path) ? styles.linkActive : {}),
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#2c3e50',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  brand: {
    margin: 0,
  },
  links: {
    display: 'flex',
    gap: '1.5rem',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
  },
  linkActive: {
    backgroundColor: '#34495e',
    fontWeight: 'bold',
  },
};
