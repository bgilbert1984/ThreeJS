// src/App.tsx
import React, { Suspense } from 'react';
import Homepage from './Homepage';
import ThreeJSErrorBoundary from './components/ErrorBoundary';
import CanvasFallback from './components/CanvasFallback';

// Loading spinner component
const Loader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    flexDirection: 'column',
    background: 'linear-gradient(to bottom, #121212, #2a2a2a)'
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '5px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '50%',
      borderTopColor: '#fff',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
    <p style={{ color: 'white', marginTop: '20px', fontFamily: 'sans-serif' }}>
      Loading 3D Experience...
    </p>
  </div>
);

const App: React.FC = () => {
  return (
    <ThreeJSErrorBoundary fallback={<CanvasFallback />}>
      <Suspense fallback={<Loader />}>
        <Homepage />
      </Suspense>
    </ThreeJSErrorBoundary>
  );
};

export default App;