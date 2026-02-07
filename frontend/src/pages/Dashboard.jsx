import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Package, Gavel, ShoppingBag } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('orders'); // orders, listings, bids
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let url = '';
            if (activeTab === 'listings') url = '/api/users/me/products';
            else if (activeTab === 'bids') url = '/api/users/me/bids';
            else url = '/api/users/me/orders';

            const res = await axios.get(url);
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

            {/* Tabs */}
            <div className="flex space-x-4 mb-8 border-b border-white/10 pb-4">
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                    <ShoppingBag size={18} /> My Orders
                </button>
                <button
                    onClick={() => setActiveTab('bids')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all ${activeTab === 'bids' ? 'bg-secondary/20 text-secondary font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                    <Gavel size={18} /> My Bids
                </button>
                {(user?.role === 'seller' || user?.role === 'admin') && (
                    <button
                        onClick={() => setActiveTab('listings')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all ${activeTab === 'listings' ? 'bg-primary/20 text-primary-light font-bold' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Package size={18} /> My Listings
                    </button>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading...</div>
            ) : data.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-2xl border border-dashed border-slate-700">
                    No items found.
                </div>
            ) : (
                <div className="bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900 text-slate-400 text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    {activeTab === 'listings' && <th className="px-6 py-4">Title</th>}
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {data.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-slate-500">#{item.id}</td>

                                        {activeTab === 'listings' && (
                                            <td className="px-6 py-4 font-bold text-white max-w-xs truncate">{item.title}</td>
                                        )}

                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase 
                                                ${(item.status === 'completed' || item.status === 'sold') ? 'bg-emerald-500/10 text-emerald-400' :
                                                    item.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-slate-700 text-slate-300'}`}>
                                                {item.status || 'Active'}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 font-bold">
                                            ₹{item.total_amount || item.amount || item.price || item.current_highest_bid}
                                        </td>

                                        <td className="px-6 py-4 text-slate-400">
                                            {new Date(item.created_at || item.timestamp).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
