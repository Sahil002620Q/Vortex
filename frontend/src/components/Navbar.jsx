import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Zap, User, LogOut, PlusCircle, Menu, X, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menus on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/" className="text-slate-300 hover:text-white font-medium transition-colors">Browse</Link>

                        {user ? (
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center space-x-2 bg-slate-800/50 hover:bg-slate-800 px-3 py-2 rounded-full border border-slate-700 transition-all"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-black font-bold text-xs uppercase">
                                        {user.username.substring(0, 2)}
                                    </div>
                                    <span className="text-sm font-medium text-slate-200">{user.username}</span>
                                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Generic Dropdown Menu */}
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden py-1 z-50 animate-fade-in-down">
                                        <div className="px-4 py-2 border-b border-slate-800 mb-1">
                                            <p className="text-xs text-slate-500 uppercase tracking-wider">Account</p>
                                            <p className="text-white font-medium truncate">{user.email}</p>
                                        </div>

                                        {(user.role === 'seller' || user.role === 'admin') && (
                                            <Link
                                                to="/create-listing"
                                                className="block px-4 py-2 text-sm text-green-400 hover:bg-slate-800 hover:bg-opacity-50 flex items-center gap-2"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <PlusCircle size={16} /> Sell Item
                                            </Link>
                                        )}

                                        <Link
                                            to="/dashboard"
                                            className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:bg-opacity-50 flex items-center gap-2"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <LayoutDashboard size={16} /> Dashboard
                                        </Link>

                                        {user.role === 'admin' && (
                                            <Link
                                                to="/admin"
                                                className="block px-4 py-2 text-sm text-pink-400 hover:bg-slate-800 hover:bg-opacity-50 flex items-center gap-2"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <ShieldCheck size={16} /> Admin Panel
                                            </Link>
                                        )}

                                        <div className="border-t border-slate-800 mt-1 pt-1">
                                            <button
                                                onClick={logout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800 hover:bg-opacity-50 flex items-center gap-2"
                                            >
                                                <LogOut size={16} /> Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors">Login</Link>
                                <Link to="/register" className="btn-primary text-white px-5 py-2 rounded-xl font-bold text-sm">
                                    Join Now
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-slate-300 hover:text-white"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMenuOpen && (
                <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-4 animate-fade-in">
                    <Link to="/" className="block text-slate-300 hover:text-white py-2" onClick={() => setIsMenuOpen(false)}>Browse</Link>

                    {user ? (
                        <>
                            <div className="h-px bg-slate-800 my-2"></div>
                            <div className="flex items-center gap-3 py-2">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black font-bold text-xs uppercase">
                                    {user.username.substring(0, 2)}
                                </div>
                                <span className="text-white font-medium">{user.username}</span>
                            </div>

                            {(user.role === 'seller' || user.role === 'admin') && (
                                <Link to="/create-listing" className="flex items-center gap-2 text-green-400 py-2" onClick={() => setIsMenuOpen(false)}>
                                    <PlusCircle size={18} /> Sell Item
                                </Link>
                            )}

                            <Link to="/dashboard" className="flex items-center gap-2 text-slate-300 py-2" onClick={() => setIsMenuOpen(false)}>
                                <LayoutDashboard size={18} /> Dashboard
                            </Link>

                            <button onClick={logout} className="flex items-center gap-2 text-red-400 py-2 w-full text-left">
                                <LogOut size={18} /> Logout
                            </button>
                        </>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <Link to="/login" className="btn-secondary text-center py-2 rounded-lg" onClick={() => setIsMenuOpen(false)}>Login</Link>
                            <Link to="/register" className="btn-primary text-center text-white py-2 rounded-lg" onClick={() => setIsMenuOpen(false)}>Join</Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
