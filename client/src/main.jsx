import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#1E1E2A',
            color: '#F0F0F5',
            border: '1px solid #2A2A3A',
          }
        }}/>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
