import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

// Set Axios Base URL
// VITE_API_URL should be set in Vercel environment variables
// Fallback to local proxy if not set
console.log('API URL:', import.meta.env.VITE_API_URL);
if (import.meta.env.VITE_API_URL) {
    axios.defaults.baseURL = import.meta.env.VITE_API_URL;

    // Interceptor to strip /api prefix in production
    // Because locally /api triggers proxy rewrite, but prod hits backend directly
    axios.interceptors.request.use(config => {
        if (config.url?.startsWith('/api/')) {
            config.url = config.url.replace('/api/', '/');
        }
        return config;
    });
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
