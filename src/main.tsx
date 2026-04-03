import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';

// Define process globally for libraries that expect it
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
}

window.addEventListener('error', (event) => {
  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '0';
  errorDiv.style.left = '0';
  errorDiv.style.width = '100%';
  errorDiv.style.backgroundColor = 'red';
  errorDiv.style.color = 'white';
  errorDiv.style.padding = '10px';
  errorDiv.style.zIndex = '9999';
  errorDiv.style.whiteSpace = 'pre-wrap';
  errorDiv.style.fontFamily = 'monospace';
  errorDiv.textContent = `Error: ${event.message}\n${event.error?.stack || ''}`;
  document.body.appendChild(errorDiv);
});

window.addEventListener('unhandledrejection', (event) => {
  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '0';
  errorDiv.style.left = '0';
  errorDiv.style.width = '100%';
  errorDiv.style.backgroundColor = 'orange';
  errorDiv.style.color = 'white';
  errorDiv.style.padding = '10px';
  errorDiv.style.zIndex = '9999';
  errorDiv.style.whiteSpace = 'pre-wrap';
  errorDiv.style.fontFamily = 'monospace';
  errorDiv.textContent = `Unhandled Rejection: ${event.reason?.message || event.reason}\n${event.reason?.stack || ''}`;
  document.body.appendChild(errorDiv);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
