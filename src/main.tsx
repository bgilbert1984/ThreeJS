import React from 'react'
import ReactDOM from 'react-dom/client'
import Homepage from './Homepage'
import './index.css'
import './components/three-extend';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Homepage />
  </React.StrictMode>,
)