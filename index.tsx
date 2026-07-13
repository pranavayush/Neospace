import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { registerSW } from 'virtual:pwa-register';

if ('serviceWorker' in navigator) {
  registerSW({ immediate: true });
}

window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = typeof event.reason === 'string' ? event.reason : (event.reason?.message || '');
  if (reasonStr.includes('Refresh Token') || reasonStr.includes('refresh_token') || reasonStr.includes('Failed to fetch') || reasonStr.includes('Load failed')) {
    event.preventDefault(); // Suppress specific Refresh Token and fetch errors causing crashes
  }
});

const originalOnError = window.onerror;
window.onerror = function(message, source, lineno, colno, error) {
  const msgStr = typeof message === 'string' ? message : (error?.message || '');
  if (msgStr.includes('Refresh Token') || msgStr.includes('refresh_token')) {
    return true; // prevent firing default event handler
  }
  if (originalOnError) return originalOnError(message, source, lineno, colno, error);
  return false;
};

const originalConsoleError = console.error;
console.error = (...args) => {
  const argStr = args.map(a => typeof a === 'object' ? String(a?.message || a) : String(a)).join(' ');
  if (argStr.includes('Refresh Token') || argStr.includes('refresh_token') || argStr.includes('Failed to fetch') || argStr.includes('Load failed')) {
    return;
  }
  originalConsoleError(...args);
};

const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const argStr = args.map(a => typeof a === 'object' ? String(a?.message || a) : String(a)).join(' ');
  if (argStr.includes('Refresh Token') || argStr.includes('refresh_token')) {
    return;
  }
  originalConsoleWarn(...args);
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);