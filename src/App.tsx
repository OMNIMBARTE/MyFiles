import React, { useEffect } from 'react';
import { ThemeProvider } from './themes/ThemeContext';
import { useExplorerStore } from './store/useExplorerStore';
import { Shell } from './components/layout/Shell';

const AppContent: React.FC = () => {
  const { initDiscovery } = useExplorerStore();

  useEffect(() => {
    initDiscovery();
  }, [initDiscovery]);

  return <Shell />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
