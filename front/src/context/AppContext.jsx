import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe usarse dentro de AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [datasetId, setDatasetId] = useState(null);
  const [modelId, setModelId] = useState(null);
  const [isCleaned, setIsCleaned] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [canPredict, setCanPredict] = useState(false);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [cleaningResults, setCleaningResults] = useState(null);
  const [modelType, setModelType] = useState('RandomForest');

  const resetFlow = () => {
    setDatasetId(null);
    setModelId(null);
    setIsCleaned(false);
    setMetrics(null);
    setCanPredict(false);
    setDatasetInfo(null);
    setCleaningResults(null);
  };

  const checkMetrics = (metricsData) => {
    // Métricas deseadas: accuracy > 0.75, precision > 0.70, recall > 0.70, f1 > 0.70
    if (metricsData) {
      const isValid = 
        metricsData.accuracy > 0.75 &&
        metricsData.precision > 0.70 &&
        metricsData.recall > 0.70 &&
        metricsData.f1_score > 0.70;
      setCanPredict(isValid);
      return isValid;
    }
    return false;
  };

  const value = {
    datasetId,
    setDatasetId,
    modelId,
    setModelId,
    isCleaned,
    setIsCleaned,
    metrics,
    setMetrics,
    canPredict,
    setCanPredict,
    datasetInfo,
    setDatasetInfo,
    cleaningResults,
    setCleaningResults,
    modelType,
    setModelType,
    resetFlow,
    checkMetrics,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
