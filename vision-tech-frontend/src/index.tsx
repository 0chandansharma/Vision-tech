import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { store } from './store';
import { fetchCurrentUser } from './store/auth/authSlice';
import './styles/index.css';

// Try to load the current user on application startup if a token exists
const token = localStorage.getItem('vision_tech_token');
if (token) {
  store.dispatch(fetchCurrentUser());
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);