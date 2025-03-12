// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './components/three-extend';

// Simple error handler that doesn't try to be too clever
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  
  // Only handle WebGL related errors to avoid breaking other functionality
  if (
    event.error?.message?.includes('WebGL') ||
    event.error?.message?.includes('context')
  ) {
    console.warn('WebGL related error caught:', event.error);
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)