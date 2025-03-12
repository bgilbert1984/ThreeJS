// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Import WebGL memory utilities for global usage
import { WebGLMemoryUtils } from './utils/webglMemoryUtils';

// Import RobustThreeApp instead of regular App
import RobustThreeApp from './RobustThreeApp';

// Global WebGL context loss detection and prevention
window.addEventListener('webglcontextlost', (event) => {
  event.preventDefault(); // Important for context restoration
  console.warn('WebGL context lost detected at application level');
}, false);

window.addEventListener('webglcontextrestored', () => {
  console.log('WebGL context restored at application level');
}, false);

// Global error handler for uncaught exceptions
window.addEventListener('error', (event) => {
  // Log the error
  console.error('Global error caught:', event.error);
  
  // If it's a WebGL-related error, try to log helpful diagnosis
  if (
    event.error?.message?.includes('WebGL') ||
    event.error?.message?.includes('canvas') ||
    event.error?.message?.includes('context') ||
    event.error?.message?.includes('material') ||
    event.error?.message?.includes('shader')
  ) {
    console.warn('WebGL-related error detected:', event.error?.message);
  }
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Create a root element with error handling
let root: ReactDOM.Root;
try {
  // Get the root element or create a fallback
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    // Create root element if missing
    const fallbackRoot = document.createElement('div');
    fallbackRoot.id = 'root';
    document.body.appendChild(fallbackRoot);
    root = ReactDOM.createRoot(fallbackRoot);
  } else {
    root = ReactDOM.createRoot(rootElement);
  }
  
  // Render the robust app
  root.render(
    <React.StrictMode>
      <RobustThreeApp />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Error initializing React application:', error);
  
  // Display a fallback error message
  document.body.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; text-align: center; background-color: #121220; color: white;">
      <h2>Application Error</h2>
      <p>Sorry, the application could not be loaded.</p>
      <button onclick="window.location.reload()" style="padding: 8px 16px; background-color: #4a4acf; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 20px;">
        Reload Application
      </button>
    </div>
  `;
}