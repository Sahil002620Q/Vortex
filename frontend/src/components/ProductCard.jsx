import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Tag } from 'lucide-react';

const ProductCard = ({ product }) => {
    const isAuction = product.listing_type === 'auction';

    return (
        <Link to={`/product/${product.id}`} className="block group">
            <div className="bg-slate-900/50 rounded-2xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
                {/* Image Area */}
                <div className="h-56 bg-slate-950 relative overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                        <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700">
                            <span className="text-4xl opacity-50">📷</span>
                        </div>
                    )}

                    <div className="absolute top-3 right-3 flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-md ${isAuction ? 'bg-secondary/80 text-white' : 'bg-emerald-500/80 text-white'}`}>
                            {isAuction ? 'Auction' : 'Buy Now'}
                        </span>
                        {product.status !== 'active' && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-md bg-red-500/80 text-white">
                                {product.status}
                            </span>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-primary-light bg-primary/10 px-2 py-1 rounded-md">
                            {product.category}
                        </span>
                        <div className="text-right">
                            {isAuction ? (
                                <div>
                                    <span className="text-xs text-slate-400 block">Current Bid</span>
                                    <span className="text-lg font-bold text-secondary">₹{product.current_highest_bid}</span>
                                </div>
                            ) : (
                                <div>
                                    <span className="text-xs text-slate-400 block">Price</span>
                                    <span className="text-lg font-bold text-emerald-400">₹{product.price}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                        {product.title}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-4 h-10">
                        {product.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-slate-500 border-t border-white/5 pt-3">
                        <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{new Date(product.created_at).toLocaleDateString()}</span>
                        </div>
                        <span className="group-hover:translate-x-1 transition-transform text-white font-medium">View Details →</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
