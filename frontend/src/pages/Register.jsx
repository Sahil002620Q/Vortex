import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'buyer'
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="glass-panel p-8 rounded-3xl w-full max-w-md border border-white/10 shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-secondary to-primary rounded-t-3xl"></div>

                <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Account</h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Username</label>
                        <input
                            type="text"
                            required
                            className="w-full rounded-xl px-4 py-3"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full rounded-xl px-4 py-3"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full rounded-xl px-4 py-3"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">I want to</label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className={`cursor-pointer border rounded-xl p-3 text-center transition-all ${formData.role === 'buyer' ? 'bg-primary/20 border-primary text-white' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="buyer"
                                    className="hidden"
                                    checked={formData.role === 'buyer'}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                />
                                <span className="font-bold">Buy</span>
                            </label>
                            <label className={`cursor-pointer border rounded-xl p-3 text-center transition-all ${formData.role === 'seller' ? 'bg-secondary/20 border-secondary text-white' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="seller"
                                    className="hidden"
                                    checked={formData.role === 'seller'}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                />
                                <span className="font-bold">Sell</span>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="w-full btn-primary text-white py-3 rounded-xl font-bold text-lg shadow-lg mt-4">
                        Register
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    Already have an account? <Link to="/login" className="text-secondary hover:text-white transition-colors font-bold">Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
