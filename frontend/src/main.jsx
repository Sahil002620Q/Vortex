import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

// Set Axios Base URL
// VITE_API_URL should be set in Vercel environment variables
// Fallback to local proxy if not set
console.log('--- DEBUG INFO ---');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('MODE:', import.meta.env.MODE);

// Hardcoded fallback for production to ensure functionality even if Env Var fails
const PROD_BACKEND = 'https://vortex-maxf.onrender.com';
const API_URL = import.meta.env.VITE_API_URL || PROD_BACKEND;

axios.defaults.baseURL = API_URL;
console.log('Using Backend URL:', API_URL);

// Interceptor to strip /api prefix 
// (The backend routes are /auth/login, /products etc., but frontend calls /api/auth/login)
axios.interceptors.request.use(config => {
    if (config.url?.startsWith('/api/')) {
        config.url = config.url.replace('/api/', '/');
    }
    return config;
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* Error banner removed since we have a hardcoded fallback */}
        <App />
    </React.StrictMode>,
)
