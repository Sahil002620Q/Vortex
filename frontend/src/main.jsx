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

if (import.meta.env.VITE_API_URL) {
    axios.defaults.baseURL = import.meta.env.VITE_API_URL;
    alert(`DEBUG: Using API URL: ${axios.defaults.baseURL}`); // Added for debugging
    console.log('Set Axios BaseURL to:', axios.defaults.baseURL);

    // Interceptor to strip /api prefix in production
    // Because locally /api triggers proxy rewrite, but prod hits backend directly
    axios.interceptors.request.use(config => {
        if (config.url?.startsWith('/api/')) {
            config.url = config.url.replace('/api/', '/');
        }
        return config;
    });
} else {
    console.warn('VITE_API_URL is NOT set. Axios will use relative paths (which basically fails in prod).');
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {!import.meta.env.VITE_API_URL && import.meta.env.MODE === 'production' && (
            <div style={{ background: '#ef4444', color: 'white', padding: '1rem', textAlign: 'center', position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 9999, fontWeight: 'bold' }}>
                CRITICAL: VITE_API_URL environment variable is missing. Login will not work.
            </div>
        )}
        <App />
    </React.StrictMode>,
)
