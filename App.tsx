
import React, { useEffect } from 'react';
import { Dashboard } from './components/Dashboard/Dashboard';
import { LoginScreen } from './components/Auth/LoginScreen';
import { useOrbitStore } from './store/useOrbitStore';

function App() {
  const { isAuthenticated, initialize, isAuthLoading } = useOrbitStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isAuthLoading) {
      return (
          <div className="w-full h-screen bg-slate-950 flex items-center justify-center text-slate-600 font-mono text-xs">
              INITIALIZING ORBIT PROTOCOLS...
          </div>
      )
  }

  return (
    <>
      {isAuthenticated ? <Dashboard /> : <LoginScreen />}
    </>
  );
}

export default App;
