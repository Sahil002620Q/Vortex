import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Search, Filter, RefreshCw, X } from 'lucide-react';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [filters, setFilters] = useState({ category: '', listing_type: '', min_price: '', max_price: '', search: '' });
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = { ...filters };
            // Remove empty filters
            Object.keys(params).forEach(key => !params[key] && delete params[key]);

            const res = await axios.get('/api/products', { params });
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [filters.category, filters.listing_type]); // Auto fetch on main filters

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProducts();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row gap-8 relative">

                {/* Mobile Filter Toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="md:hidden flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg mb-4 w-fit border border-slate-700"
                >
                    <Filter size={18} /> Filters
                </button>

                {/* Filters Sidebar - Collapsible on Mobile, Sticky on Desktop */}
                <div className={`
                    fixed md:sticky top-0 md:top-24 left-0 h-full md:h-auto w-72 md:w-64 z-40 bg-slate-900 md:bg-transparent p-6 md:p-0 transition-transform duration-300 ease-in-out border-r md:border-r-0 border-slate-800
                    ${showFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    <div className="bg-slate-900/50 md:p-6 rounded-2xl md:border border-white/5 h-full overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Filter size={20} className="text-primary" /> Filters
                            </h2>
                            <div className="flex gap-2">
                                <button onClick={fetchProducts} className="text-slate-400 hover:text-white" title="Refresh">
                                    <RefreshCw size={16} />
                                </button>
                                <button onClick={() => setShowFilters(false)} className="md:hidden text-slate-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Search */}
                        <form onSubmit={handleSearch} className="mb-6 relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl text-sm"
                                value={filters.search}
                                onChange={e => setFilters({ ...filters, search: e.target.value })}
                            />
                            <Search size={16} className="absolute left-3 top-2.5 text-slate-500" />
                        </form>

                        {/* Type Filter */}
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase">Type</label>
                            <div className="space-y-2">
                                {['', 'direct', 'auction'].map(type => (
                                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="listing_type"
                                            checked={filters.listing_type === type}
                                            onChange={() => setFilters({ ...filters, listing_type: type })}
                                            className="text-primary focus:ring-primary"
                                        />
                                        <span className="capitalize text-slate-300">{type || 'All'}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase">Price Range</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="w-full px-3 py-2 text-sm rounded-lg"
                                    value={filters.min_price}
                                    onChange={e => setFilters({ ...filters, min_price: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="w-full px-3 py-2 text-sm rounded-lg"
                                    value={filters.max_price}
                                    onChange={e => setFilters({ ...filters, max_price: e.target.value })}
                                />
                            </div>
                            <button
                                onClick={fetchProducts}
                                className="w-full mt-3 btn-secondary text-xs py-2 rounded-lg"
                            >
                                Apply Price
                            </button>
                        </div>
                    </div>
                </div>

                {/* Overlay for mobile drawer */}
                {showFilters && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                        onClick={() => setShowFilters(false)}
                    />
                )}

                {/* Main Content */}
                <div className="flex-1">
                    <div className="mb-6 flex justify-between items-center">
                        <h1 className="text-3xl font-bold">Marketplace</h1>
                        <span className="text-slate-400">{products.length} Items found</span>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    {!loading && products.length === 0 && (
                        <div className="text-center py-20 text-slate-500">
                            <p className="text-xl">No products found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
