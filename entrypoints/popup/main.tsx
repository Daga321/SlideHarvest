import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './style.css';

/**
 * Entry point for the SlideHarvest extension popup
 * Renders the main App component using React 18's createRoot API
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
