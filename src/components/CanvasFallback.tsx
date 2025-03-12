// src/components/CanvasFallback.tsx
import React from 'react';

/**
 * A simplified fallback component that renders static content
 * when Three.js/WebGL components cannot be loaded properly
 */
const CanvasFallback: React.FC = () => {
  return (
    <div className="canvas-fallback" style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#121220',
      color: 'white',
      flexDirection: 'column',
      padding: '20px',
      textAlign: 'center'
    }}>
      <svg 
        width="100" 
        height="100" 
        viewBox="0 0 100 100"
        style={{ marginBottom: '20px' }}
      >
        <circle cx="50" cy="50" r="45" fill="none" stroke="#4444ff" strokeWidth="2" />
        <path 
          d="M30,50 L45,65 L70,35" 
          stroke="#4444ff" 
          strokeWidth="3" 
          fill="none"
        />
      </svg>
      
      <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem' }}>
        3D Visualization
      </h2>
      
      <p style={{ margin: '0 0 20px 0', maxWidth: '400px' }}>
        The interactive 3D experience couldn't be loaded. This could be due to 
        browser compatibility issues or hardware limitations.
      </p>
      
      <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
        Try using Chrome or Firefox for the best experience.
      </div>
      
      <button 
        onClick={() => window.location.reload()}
        style={{
          marginTop: '20px',
          padding: '8px 16px',
          background: '#4444ff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Try Again
      </button>
    </div>
  );
};

export default CanvasFallback;