import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateListing = () => {
    const navigate = useNavigate();
    const [listingType, setListingType] = useState('direct');
    const [formData, setFormData] = useState({
        title: '', description: '', category: '', images: '',
        price: '', stock: '1', start_bid: '', min_bid_increment: '10'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Prepare payload
            const payload = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                images: formData.images ? [formData.images] : [],
                listing_type: listingType
            };

            if (listingType === 'direct') {
                payload.price = parseFloat(formData.price);
                payload.stock = parseInt(formData.stock);
            } else {
                payload.start_bid = parseFloat(formData.start_bid);
                payload.min_bid_increment = parseFloat(formData.min_bid_increment);
                // end_time logic? For now backend allows null or we could set +24h
            }

            await axios.post('/api/products', payload);
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to create listing");
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-white mb-8">Create New Listing</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setListingType('direct')}
                        className={`p-4 rounded-2xl border-2 font-bold transition-all ${listingType === 'direct' ? 'border-primary bg-primary/20 text-white' : 'border-slate-700 bg-slate-900/50 text-slate-400'}`}
                    >
                        Direct Sale
                    </button>
                    <button
                        type="button"
                        onClick={() => setListingType('auction')}
                        className={`p-4 rounded-2xl border-2 font-bold transition-all ${listingType === 'auction' ? 'border-secondary bg-secondary/20 text-white' : 'border-slate-700 bg-slate-900/50 text-slate-400'}`}
                    >
                        Auction
                    </button>
                </div>

                <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Title</label>
                        <input type="text" required className="w-full rounded-xl px-4 py-3"
                            value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>
                        <input type="text" required className="w-full rounded-xl px-4 py-3" placeholder="e.g. Phone, Laptop"
                            value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
                        <textarea required className="w-full rounded-xl px-4 py-3 h-32"
                            value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Image</label>
                        <div className="space-y-3">
                            {/* File Upload */}
                            <div className="flex items-center gap-4">
                                <label className="flex-1 cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-600 border-dashed rounded-xl px-4 py-3 text-center transition-colors">
                                    <span className="text-sm text-slate-300">
                                        {formData.uploading ? 'Uploading...' : 'Click to Upload Image'}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;

                                            setFormData(prev => ({ ...prev, uploading: true }));
                                            const uploadData = new FormData();
                                            uploadData.append('file', file);

                                            try {
                                                const res = await axios.post('/api/upload', uploadData, {
                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                });
                                                // Backend returns relative path, prepend API URL if needed or handle in component
                                                // For local dev, relative path works with proxy. 
                                                // For prod, we need full URL if backend is elsewhere.
                                                // Simplified: store relative path, backend serves static.
                                                setFormData(prev => ({ ...prev, images: res.data.url, uploading: false }));
                                            } catch (err) {
                                                alert("Upload failed");
                                                setFormData(prev => ({ ...prev, uploading: false }));
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            <div className="text-center text-xs text-slate-500 uppercase font-bold">- OR -</div>

                            {/* URL Input */}
                            <input
                                type="url"
                                className="w-full rounded-xl px-4 py-3 bg-slate-900 border border-slate-700"
                                placeholder="Enter Image URL directly..."
                                value={formData.images}
                                onChange={e => setFormData({ ...formData, images: e.target.value })}
                            />
                        </div>
                        {formData.images && (
                            <img src={formData.images} alt="Preview" className="mt-4 h-32 w-auto rounded-lg border border-slate-700 object-cover" />
                        )}
                    </div>

                    {listingType === 'direct' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Price (₹)</label>
                                <input type="number" required className="w-full rounded-xl px-4 py-3"
                                    value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Stock</label>
                                <input type="number" required className="w-full rounded-xl px-4 py-3"
                                    value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Start Bid (₹)</label>
                                <input type="number" required className="w-full rounded-xl px-4 py-3"
                                    value={formData.start_bid} onChange={e => setFormData({ ...formData, start_bid: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Min Increment</label>
                                <input type="number" required className="w-full rounded-xl px-4 py-3"
                                    value={formData.min_bid_increment} onChange={e => setFormData({ ...formData, min_bid_increment: e.target.value })} />
                            </div>
                        </div>
                    )}
                </div>

                <button type="submit" className="w-full btn-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg">
                    Post Listing
                </button>
            </form>
        </div>
    );
};

export default CreateListing;
