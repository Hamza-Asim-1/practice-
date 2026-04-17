import React from 'react';
import { 
    X, 
    ChevronRight, 
    Package, 
    Info, 
    ShieldCheck, 
    ShieldAlert, 
    Activity, 
    FileText,
    Tag,
    Layers,
    Warehouse,
    TrendingUp,
    List,
    Calendar,
    ExternalLink
} from 'lucide-react';
import { normalizeSpecifications } from '../../utils/specUtils';

export default function AdminProductDetailsModal({ product, onClose }) {
    if (!product) return null;

    const normalizedSpecs = product.specifications ? normalizeSpecifications(product.specifications) : {};
    const hasSpecs = Object.keys(normalizedSpecs).length > 0;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 md:p-12">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
            <div className="admin-card w-full max-w-4xl max-h-[90vh] relative z-101 animate-in zoom-in duration-200 flex flex-col p-0 overflow-hidden border-black/5 shadow-2xl">
                
                {/* Header */}
                <div className="p-8 border-b border-black/5 flex justify-between items-center bg-black/5">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-accent-lime/10 border border-accent-lime/20 flex items-center justify-center text-accent-lime shrink-0">
                            {product.imageUrl ? (
                                <img src={product.imageUrl} className="w-full h-full object-cover rounded-2xl" alt={product.name} />
                            ) : (
                                <Package size={32} />
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-text-cream tracking-tight m-0 uppercase">{product.name}</h3>
                            <div className="flex items-center gap-3 mt-1">
                                <span className={`status-badge ${(product.categoryObj?.name || product.category || 'beef').toLowerCase()}`}>{product.categoryObj?.name || product.category}</span>
                                <span className="text-black/60 text-[10px] font-bold uppercase tracking-widest">Product ID: {product.id}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-black/20 hover:text-text-cream hover:bg-black/10 transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
                        
                        {/* Summary Column */}
                        <div className="lg:col-span-2 p-8 space-y-10 border-r border-black/5">
                            
                            {/* Narrative Section */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20 mb-4 flex items-center gap-2">
                                    <Tag size={12} /> Product Description
                                </label>
                                <div className="bg-black/5 border border-black/5 rounded-2xl p-6">
                                    <p className="text-black/70 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                        {product.description || "No description provided."}
                                    </p>
                                </div>
                            </div>

                             <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20 mb-3">Product Price</label>
                                    <div className="text-2xl font-black text-text-cream">£{Number(product.basePrice || 0).toFixed(2)}</div>
                                    <p className="text-[10px] text-black/20 font-black uppercase tracking-widest mt-1">Price per kg/unit</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20 mb-3">Product Status</label>
                                    <div className={`text-sm font-black uppercase tracking-widest ${product.approvalStatus === 'APPROVED' ? 'text-accent-lime' : 'text-amber-500'}`}>
                                        {product.approvalStatus || 'PENDING'}
                                    </div>
                                    <p className="text-[10px] text-black/20 font-black uppercase tracking-widest mt-1">Current verification state</p>
                                </div>
                            </div>
                             <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20 mb-4">Certification Status</label>
                                <div className={`p-6 rounded-2xl border flex items-center justify-between ${product.isHmcCertified ? 'bg-accent-lime/5 border-accent-lime/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${product.isHmcCertified ? 'bg-accent-lime text-black shadow-[0_0_20px_rgba(192,215,45,0.3)]' : 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'}`}>
                                            {product.isHmcCertified ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-text-cream uppercase tracking-tight">HMC Certification</div>
                                            <div className="text-[10px] text-black/40 font-bold uppercase tracking-widest mt-0.5">Halal Monitoring Committee Standard</div>
                                        </div>
                                    </div>
                                    <div className={`text-xs font-black px-4 py-1.5 rounded-lg border uppercase tracking-[0.15em] ${product.isHmcCertified ? 'bg-accent-lime/20 text-accent-lime border-accent-lime/20' : 'bg-red-500/20 text-red-500 border-red-500/20'}`}>
                                        {product.isHmcCertified ? 'CERTIFIED' : 'NOT CERTIFIED'}
                                    </div>
                                </div>
                            </div>

                            {/* Specifications Section */}
                            {product.specifications && typeof product.specifications === 'object' && Object.keys(product.specifications).length > 0 && (
                                <div className="space-y-6">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20 flex items-center gap-2">
                                        <List size={12} /> Custom Specifications
                                    </label>
                                    
                                    {hasSpecs ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            {Object.entries(normalizedSpecs).map(([key, values]) => (
                                                <div key={key} className="bg-black/5 border border-black/5 rounded-2xl p-5 flex items-center justify-between group hover:bg-black/10 transition-all">
                                                    <div>
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-1">{key}</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {values.map((val, idx) => (
                                                                <span key={idx} className="text-xs font-bold text-text-cream bg-accent-lime/10 px-3 py-1 rounded-lg border border-accent-lime/20 leading-none">
                                                                    {val}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-black/5 border border-black/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center opacity-40">
                                            <Info size={32} className="mb-4 text-black/20" />
                                            <p className="text-sm font-bold m-0 uppercase tracking-widest leading-none">No custom specifications defined</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sidebar Column */}
                        <div className="bg-black/5 p-8 space-y-8">
                            
                            {/* Inventory Logistics */}
                             <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20 mb-4 flex items-center gap-2">
                                    <Package size={12} /> Stock Levels
                                </label>
                                <div className="space-y-4">
                                    <div className="bg-black/5 border border-black/5 rounded-2xl p-5">
                                        <div className="text-2xl font-black text-text-cream">{Number(product.stock?.quantity || 0).toFixed(1)}kg</div>
                                        <div className="text-[10px] text-black/20 font-black uppercase tracking-widest mt-1">Total Current Stock</div>
                                    </div>
                                    <div className="bg-black/5 border border-black/5 rounded-2xl p-5">
                                        <div className="text-lg font-black text-black/60">{Number(product.stock?.lowStockThreshold || 0).toFixed(0)}kg</div>
                                        <div className="text-[10px] text-black/20 font-black uppercase tracking-widest mt-1">Low Stock Warning</div>
                                    </div>
                                </div>
                            </div>

                            {/* Lifecycle & Tracking */}                             <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20 mb-4 flex items-center gap-2">
                                    <Calendar size={12} /> Product Info
                                </label>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-black/5">
                                        <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Added On</span>
                                        <span className="text-[10px] font-bold text-text-cream uppercase tabular-nums">{new Date(product.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-black/5">
                                        <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Visibility</span>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${product.status === 'LIVE' ? 'text-accent-lime' : 'text-black/20'}`}>{product.status}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-black/5">
                                        <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Price Plan</span>
                                        <span className="text-[10px] font-bold text-text-cream uppercase tracking-widest">Regular</span>
                                    </div>
                                </div>
                            </div>


                            {/* Quick Note */}
                            <div className="mt-auto">
                                <div className="p-4 bg-accent-lime/10 border border-accent-lime/20 rounded-xl flex items-start gap-3">
                                    <Info size={14} className="text-accent-lime shrink-0 mt-0.5" />
                                    <p className="text-[9px] font-black uppercase tracking-wider text-accent-lime/70 leading-relaxed">
                                        Review all product metrics against HMC physical certifications before finalizing lifecycle status.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-black/5 bg-black/5 flex gap-4">
                    <button onClick={onClose} className="bg-accent-lime text-text-cream text-[10px] font-black uppercase tracking-widest flex-1 py-4 rounded-xl group">
                        <span className="flex items-center justify-center gap-2">
                            Close <X size={16} className="group-hover:scale-110 transition-transform" />
                        </span>
                    </button>
                    {product.imageUrl && (
                        <a 
                            href={product.imageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-black/5 border border-black/10 text-text-cream text-[10px] font-black uppercase tracking-widest px-8 rounded-xl hover:bg-black/10 transition-all flex items-center gap-2"
                        >
                            Enlarge Asset <ExternalLink size={14} />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
