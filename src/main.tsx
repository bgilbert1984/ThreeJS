// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'

// Import Three.js extensions before anything else
import './components/three-extend';

// Then import styles and components
import './index.css'
import App from './App'

// Global error handler for better error reporting
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Add specific handler for WebGL context loss
window.addEventListener('webglcontextlost', (event) => {
  event.preventDefault(); // This is important
  console.warn('WebGL context lost. Please refresh the page.');
}, false);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)