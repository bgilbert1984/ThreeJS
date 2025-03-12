import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Create loading/error UI
const webGLError = document.createElement('div');
webGLError.className = 'webgl-error hidden';
webGLError.innerHTML = `
  <div>
    <div class="spinner"></div>
    <p>WebGL context was lost. Attempting to restore...</p>
  </div>
`;
document.body.appendChild(webGLError);

// Global WebGL context loss handler
const handleContextLoss = (event: Event) => {
  event.preventDefault();
  console.warn('WebGL context lost. Attempting to restore...');
  
  // Show loading UI
  webGLError.classList.remove('hidden');
  
  // Store current URL to restore after reload
  const currentUrl = window.location.href;
  localStorage.setItem('lastUrl', currentUrl);
  
  // Try to restore context after a short delay
  setTimeout(() => {
    if (document.hidden) {
      // If page is hidden, reload when it becomes visible
      document.addEventListener('visibilitychange', function onVisibilityChange() {
        if (!document.hidden) {
          window.location.reload();
          document.removeEventListener('visibilitychange', onVisibilityChange);
        }
      });
    } else {
      window.location.reload();
    }
  }, 1000);
};

// Handle WebGL context restoration
const handleContextRestored = () => {
  console.log('WebGL context restored');
  // Hide loading UI
  webGLError.classList.add('hidden');
  
  const lastUrl = localStorage.getItem('lastUrl');
  if (lastUrl) {
    localStorage.removeItem('lastUrl');
    if (lastUrl !== window.location.href) {
      window.location.href = lastUrl;
    }
  }
};

// Add global context loss handlers
if (typeof window !== 'undefined') {
  window.addEventListener('webglcontextlost', handleContextLoss, false);
  window.addEventListener('webglcontextrestored', handleContextRestored, false);
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
