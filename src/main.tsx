import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (!(window as any).__APP_INITIALIZED__) {
  const rootEl = document.getElementById('root');
  if (rootEl) {
    (window as any).__APP_INITIALIZED__ = true;
    createRoot(rootEl).render(<App />);
  }
}
