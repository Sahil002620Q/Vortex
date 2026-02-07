import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Zap, User, LogOut, PlusCircle } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="glass-panel sticky top-0 z-50 shadow-lg border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="bg-primary p-2 rounded-none transform rotate-3 group-hover:rotate-12 transition-transform">
                            <Zap className="text-black w-6 h-6 fill-current" />
                        </div>
                        <span className="text-3xl font-black bg-clip-text text-white tracking-tighter">
                            VORTEX
                        </span>
                    </Link>

                    <div className="flex items-center space-x-6">
                        <Link to="/" className="text-slate-300 hover:text-white font-medium transition-colors">Browse</Link>

                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-slate-300 hover:text-white font-medium transition-colors">Dashboard</Link>
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="text-secondary hover:text-pink-400 font-bold tracking-wide">Admin</Link>
                                )}

                                <div className="h-6 w-px bg-slate-700/50 mx-2"></div>

                                <div className="flex items-center space-x-4">
                                    <span className="text-slate-400 text-sm hidden sm:inline">Hi, <span className="text-white font-semibold">{user.username}</span></span>

                                    {(user.role === 'seller' || user.role === 'admin') && (
                                        <Link to="/create-listing" className="btn-primary text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center space-x-2">
                                            <PlusCircle size={16} />
                                            <span>Sell</span>
                                        </Link>
                                    )}

                                    <button onClick={logout} className="text-slate-400 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/5">
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors">Login</Link>
                                <Link to="/register" className="btn-primary text-white px-5 py-2 rounded-xl font-bold text-sm">
                                    Join Now
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
