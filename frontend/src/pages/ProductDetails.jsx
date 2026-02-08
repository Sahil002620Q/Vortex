import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Clock, ShieldCheck, Truck, Trophy } from 'lucide-react';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState('');
    const [ws, setWs] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await axios.get(`/api/products/${id}`);
            setProduct(res.data);
            if (res.data.listing_type === 'auction') {
                fetchBids(); // Fetch history
                connectWebSocket();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBids = async () => {
        try {
            const res = await axios.get(`/api/products/${id}/bids`);
            setMessages(res.data);
        } catch (err) {
            console.error("Failed to fetch bids", err);
        }
    };

    // WebSocket for Real-time Bidding
    const connectWebSocket = () => {
        let wsUrl;

        if (import.meta.env.VITE_API_URL) {
            // Production: Replace http/https with ws/wss from env var
            const apiUrl = import.meta.env.VITE_API_URL;
            const wsProtocol = apiUrl.startsWith('https') ? 'wss:' : 'ws:';
            // Remove protocol from apiUrl to get host
            const host = apiUrl.replace(/^https?:\/\//, '');
            // Construct WS URL
            // Note: backend expects /ws/bids/{id}, mounted at root if not proxying
            // or if using Render, just strict path
            wsUrl = `${wsProtocol}//${host}/ws/bids/${id}`;
        } else {
            // Development: Use relative path (Vite proxy)
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            wsUrl = `${protocol}//${window.location.host}/ws/bids/${id}`;
        }

        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log('Connected to Auction Stream');
        };

        socket.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === 'new_bid' && msg.product_id == id) {
                    setProduct(prev => ({
                        ...prev,
                        current_highest_bid: msg.amount
                    }));
                    // Add new bid to top of list
                    setMessages(prev => [{
                        username: msg.username,
                        amount: msg.amount,
                        timestamp: msg.timestamp
                    }, ...prev]);
                }
            } catch (e) {
                // Handle legacy text messages or errors
                console.log("WS Message:", event.data);
            }
        };

        setWs(socket);

        return () => socket.close();
    };

    const handleBuyNow = async () => {
        if (!user) return navigate('/login');
        if (!confirm("Confirm purchase?")) return;

        try {
            await axios.post(`/api/products/${id}/buy`);
            alert("Purchase Successful!");
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.detail || "Purchase failed");
        }
    };

    const handlePlaceBid = async (e) => {
        e.preventDefault();
        if (!user) return navigate('/login');

        try {
            await axios.post(`/api/products/${id}/bid`, { amount: parseFloat(bidAmount) });
            setBidAmount('');
            // UI updates via WebSocket
        } catch (err) {
            alert(err.response?.data?.detail || "Bid failed");
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!product) return <div className="text-center py-20">Product not found</div>;

    const isAuction = product.listing_type === 'auction';
    const minBid = isAuction ? product.current_highest_bid + product.min_bid_increment : 0;

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row gap-12">
                {/* Images */}
                <div className="w-full md:w-1/2">
                    <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 h-[500px] flex items-center justify-center relative">
                        {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt={product.title} className="max-h-full max-w-full object-contain" />
                        ) : (
                            <span className="text-6xl opacity-30">📷</span>
                        )}

                        {product.status !== 'active' && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-5xl font-bold text-white border-4 border-white px-6 py-2 transform -rotate-12 uppercase">
                                    {product.status}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Details */}
                <div className="w-full md:w-1/2 space-y-8">
                    <div>
                        <div className="flex justify-between items-start">
                            <span className="text-sm font-bold text-primary-light bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
                                {product.category}
                            </span>
                            {isAuction && (
                                <span className="flex items-center gap-1 text-red-400 font-bold animate-pulse">
                                    <Clock size={16} /> Live Auction
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2">{product.title}</h1>
                        <p className="text-slate-400 leading-relaxed text-lg">{product.description}</p>
                    </div>

                    <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/5">
                        {isAuction ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-slate-400 text-sm uppercase block mb-1">Current Highest Bid</span>
                                        <span className="text-4xl font-bold text-secondary">₹{product.current_highest_bid}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-slate-500 text-xs uppercase block">Min Increment</span>
                                        <span className="text-slate-300">₹{product.min_bid_increment}</span>
                                    </div>
                                </div>

                                {product.status === 'active' && (
                                    <form onSubmit={handlePlaceBid} className="flex gap-4 pt-4 border-t border-white/5">
                                        <div className="relative flex-1">
                                            <span className="absolute left-4 top-3.5 text-slate-500">₹</span>
                                            <input
                                                type="number"
                                                placeholder={`Min ₹${minBid}`}
                                                className="w-full pl-8 pr-4 py-3 rounded-xl"
                                                value={bidAmount}
                                                onChange={e => setBidAmount(e.target.value)}
                                                min={minBid}
                                                step="any"
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn-primary text-white px-8 rounded-xl font-bold shadow-lg shadow-violet-500/20">
                                            Place Bid
                                        </button>
                                    </form>
                                )}

                                {/* Live Feed & History */}
                                <div className="mt-6">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Bid History</h3>
                                    <div className="bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                                        {messages.length === 0 ? (
                                            <p className="p-4 text-slate-500 text-sm text-center italic">No bids yet. Be the first!</p>
                                        ) : (
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-800 text-slate-400 sticky top-0">
                                                    <tr>
                                                        <th className="px-4 py-2 font-medium">User</th>
                                                        <th className="px-4 py-2 font-medium">Amount</th>
                                                        <th className="px-4 py-2 font-medium text-right">Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800">
                                                    {messages.map((bid, i) => (
                                                        <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                                                            <td className="px-4 py-2 font-medium text-white">{bid.username}</td>
                                                            <td className="px-4 py-2 text-primary font-bold">₹{bid.amount}</td>
                                                            <td className="px-4 py-2 text-slate-500 text-right text-xs">
                                                                {new Date(bid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="mb-6">
                                    <span className="text-slate-400 text-sm uppercase block mb-1">Price</span>
                                    <span className="text-4xl font-bold text-emerald-400">₹{product.price}</span>
                                </div>

                                {product.status === 'active' && (
                                    <button
                                        onClick={handleBuyNow}
                                        className="w-full btn-primary text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-emerald-500/10 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400"
                                    >
                                        Buy Now
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
