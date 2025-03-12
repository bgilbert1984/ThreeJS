// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './components/three-extend';

// Global error handler for unexpected errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  
  // Only handle Three.js and WebGL related errors
  if (
    event.error?.message?.includes('THREE') || 
    event.error?.message?.includes('WebGL') ||
    event.error?.message?.includes('Canvas') ||
    event.error?.stack?.includes('three')
  ) {
    // Prevent default browser error handling
    event.preventDefault();
    
    // Log the error for debugging
    console.warn('Three.js related error caught:', event.error);
    
    // Create UI to inform user (only if one doesn't already exist)
    if (!document.getElementById('threejs-error-overlay')) {
      const errorDiv = document.createElement('div');
      errorDiv.id = 'threejs-error-overlay';
      errorDiv.style.position = 'fixed';
      errorDiv.style.top = '0';
      errorDiv.style.left = '0';
      errorDiv.style.width = '100%';
      errorDiv.style.height = '100%';
      errorDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
      errorDiv.style.color = 'white';
      errorDiv.style.padding = '2rem';
      errorDiv.style.zIndex = '9999';
      errorDiv.style.display = 'flex';
      errorDiv.style.flexDirection = 'column';
      errorDiv.style.alignItems = 'center';
      errorDiv.style.justifyContent = 'center';
      
      errorDiv.innerHTML = `
        <h2 style="margin-bottom: 1rem;">3D Rendering Error</h2>
        <p>There was a problem initializing the 3D visualization.</p>
        <p>This could be due to hardware limitations or browser compatibility issues.</p>
        <button id="reload-btn" style="
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background-color: #4a4afe;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">Reload Page</button>
      `;
      
      document.body.appendChild(errorDiv);
      
      // Add reload handler
      document.getElementById('reload-btn')?.addEventListener('click', () => {
        window.location.reload();
      });
    }
    
    return true;
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)