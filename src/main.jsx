import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.jsx';
import { AuthProvider } from './app/AuthContext.jsx';
import './styles/global.css';
import './styles/smm-order.css';
import './styles/effects.css';
import './styles/auth-dashboard.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
