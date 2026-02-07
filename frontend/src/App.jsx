import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateListing from './pages/CreateListing';
import Dashboard from './pages/Dashboard';
import ProductDetails from './pages/ProductDetails';
import AdminPanel from './pages/AdminPanel';

// Placeholder components for now
const Placeholder = ({ title }) => (
    <div className="pt-24 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
        <p className="text-slate-400">Coming Soon...</p>
    </div>
);

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-dark-950 text-white pb-20">
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/product/:id" element={<ProductDetails />} />
                        <Route path="/create-listing" element={<CreateListing />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/admin" element={<AdminPanel />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
