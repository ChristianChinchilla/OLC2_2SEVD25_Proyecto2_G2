import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Upload from './pages/Upload';
import Clean from './pages/Clean';
import Train from './pages/Train';
import Metrics from './pages/Metrics';
import Tune from './pages/Tune';
import Predict from './pages/Predict';
import Insights from './pages/Insights';
import ExportReports from './pages/ExportReports';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div style={styles.app}>
          <Navbar />
          <main style={styles.main}>
            <Routes>
              <Route path="/" element={<Navigate to="/upload" replace />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/clean" element={<Clean />} />
              <Route path="/train" element={<Train />} />
              <Route path="/metrics" element={<Metrics />} />
              <Route path="/tune" element={<Tune />} />
              <Route path="/predict" element={<Predict />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/export-reports" element={<ExportReports />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#ecf0f1',
  },
  main: {
    minHeight: 'calc(100vh - 70px)',
  },
};
