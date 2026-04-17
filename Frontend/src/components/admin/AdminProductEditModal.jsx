import React, { useState, useEffect } from 'react';
import { Tag, X, ChevronRight, ShieldCheck, ShieldAlert, Package, Activity, Info, Upload, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import SpecificationsManager from './SpecificationsManager';

export default function AdminProductEditModal({ product, onClose, onSave }) {
    const [categories, setCategories] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [editForm, setEditForm] = useState({ 
        name: '', 
        category: 'BEEF', 
        categoryId: '', // Added categoryId
        status: 'AVAILABLE',
        basePrice: '', 
        description: '',
        isHmcCertified: true,
        quantity: '0',
        lowStockThreshold: '5',
        imageUrl: '',
        specifications: {}
    });

    const API_BASE = import.meta.env.VITE_API_BASE;

    useEffect(() => {
        fetch(`${API_BASE}/categories`)
            .then(r => r.json())
            .then(data => setCategories(data))
            .catch(err => console.error('Failed to load categories', err));
    }, []);

    useEffect(() => {
        if (product) {
            setEditForm({
                name: product.name,
                category: product.category,
                categoryId: product.categoryId || '', // Added categoryId
                basePrice: product.basePrice,
                status: product.status || 'AVAILABLE',
                description: product.description || '',
                isHmcCertified: product.isHmcCertified ?? true,
                quantity: String(product.stock?.quantity || 0),
                lowStockThreshold: String(product.stock?.lowStockThreshold || 5),
                imageUrl: product.imageUrl || '',
                specifications: product.specifications || {}
            });
        }
    }, [product]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ 
            ...editForm, 
            isHmcCertified: String(editForm.isHmcCertified),
            basePrice: Number(editForm.basePrice),
            specifications: editForm.specifications,
            stock: {
                quantity: Number(editForm.quantity),
                lowStockThreshold: Number(editForm.lowStockThreshold)
            }
        }, selectedFile);
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 md:p-12">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
            <div className="admin-card w-full max-w-2xl max-h-[90vh] relative z-101 animate-in zoom-in duration-200 flex flex-col p-0 overflow-hidden border-black/5 shadow-2xl">
                <div className="p-8 border-b border-black/5 flex justify-between items-center bg-black/2">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-accent-lime/10 border border-accent-lime/20 flex items-center justify-center text-accent-lime">
                            <Package size={24} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-black m-0">Edit Product</h3>
                            <p className="text-black/60 text-[10px] font-bold uppercase tracking-widest mt-1">Product ID: {product?.id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-black/20 hover:text-black hover:bg-black/10 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {/* section: primary identification */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block">Product Name</label>
                                <input 
                                    className="admin-input w-full" 
                                    value={editForm.name} 
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })} 
                                    required 
                                />
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block">Category</label>
                                <select 
                                    className="admin-input w-full" 
                                    value={editForm.categoryId || editForm.category} 
                                    onChange={e => {
                                        const selectedId = e.target.value;
                                        const selectedCat = categories.find(c => c.id === selectedId);
                                        setEditForm({ 
                                            ...editForm, 
                                            categoryId: selectedId,
                                            category: selectedCat ? selectedCat.name : editForm.category 
                                        });
                                    }}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block">Price (£)</label>
                                <input 
                                    className="admin-input w-full" 
                                    type="number" 
                                    step="0.01" 
                                    value={editForm.basePrice} 
                                    onChange={e => setEditForm({ ...editForm, basePrice: e.target.value })} 
                                    required 
                                />
                            </div>
                        </div>
                    </div>

                    {/* section: inventory & logistics */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block">Stock Quantity (kg)</label>
                                <input 
                                    className="admin-input w-full" 
                                    type="number" 
                                    step="0.1" 
                                    value={editForm.quantity} 
                                    onChange={e => setEditForm({ ...editForm, quantity: e.target.value })} 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block">Low Stock Alert</label>
                                <input 
                                    className="admin-input w-full" 
                                    type="number" 
                                    value={editForm.lowStockThreshold} 
                                    onChange={e => setEditForm({ ...editForm, lowStockThreshold: e.target.value })} 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block">Product Status</label>
                                <select 
                                    className="admin-input w-full" 
                                    value={editForm.status} 
                                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                                >
                                    <option>AVAILABLE</option>
                                    <option>OUT_OF_STOCK</option>
                                    <option>LIVE</option>
                                    <option>HIDDEN</option>
                                </select>
                            </div>
                        </div>

                        <div 
                            onClick={() => setEditForm({ ...editForm, isHmcCertified: !editForm.isHmcCertified })}
                            className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${editForm.isHmcCertified ? 'bg-accent-lime/10 border-accent-lime/30' : 'bg-red-500/10 border-red-500/20 grayscale'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editForm.isHmcCertified ? 'bg-accent-lime text-black' : 'bg-red-500 text-white'}`}>
                                    {editForm.isHmcCertified ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                                </div>
                                <div>
                                    <div className="text-xs font-black uppercase tracking-wider text-black">HMC Certified</div>
                                    <div className="text-[10px] text-black/40 font-bold uppercase tracking-widest">Verify Halal Monitoring Committee compliance</div>
                                </div>
                            </div>
                            <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${editForm.isHmcCertified ? 'bg-accent-lime/20 text-accent-lime border-accent-lime/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                {editForm.isHmcCertified ? 'CERTIFIED' : 'NOT CERTIFIED'}
                            </div>
                        </div>
                    </div>

                    {/* section: media & assets */}
                    <div className="space-y-6">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block">Product Media</label>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 bg-black/5 border border-black/5 rounded-2xl p-4 transition-all hover:bg-black/10">
                                <div className="w-16 h-16 rounded-xl bg-white border border-black/5 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                    {selectedFile ? (
                                        <img src={URL.createObjectURL(selectedFile)} className="w-full h-full object-cover" />
                                    ) : editForm.imageUrl ? (
                                        <img src={editForm.imageUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <Package size={24} className="text-black/10" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <input 
                                        className="w-full bg-transparent text-[11px] font-bold text-black outline-none placeholder:text-black/20 pb-2 border-b border-black/5" 
                                        value={editForm.imageUrl} 
                                        placeholder="Paste asset link..."
                                        onChange={e => setEditForm({ ...editForm, imageUrl: e.target.value })} 
                                    />
                                    <div className="flex items-center gap-3">
                                        <label className="bg-white/40 hover:bg-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border border-black/5 cursor-pointer transition-all flex items-center gap-2 group/upload">
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={e => setSelectedFile(e.target.files[0])}
                                            />
                                            <Upload size={10} className="group-hover/upload:scale-110 transition-transform" />
                                            {selectedFile ? 'Change File' : 'Upload New'}
                                        </label>
                                        {selectedFile && (
                                            <button 
                                                onClick={() => setSelectedFile(null)}
                                                className="text-[9px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-colors"
                                            >
                                                Clear Upload
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {selectedFile && (
                                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-accent-lime bg-accent-lime/10 px-4 py-2 rounded-xl border border-accent-lime/20 flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
                                    <ShieldCheck size={12} /> Ready for Cloudinary sync: {selectedFile.name}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* section: narrative */}
                    <div className="space-y-6">
                        <SpecificationsManager 
                            specifications={editForm.specifications}
                            onChange={(specs) => setEditForm({ ...editForm, specifications: specs })}
                            theme="light"
                        />
                        
                        <div className="pt-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block">Description</label>
                            <textarea 
                                rows={4}
                                className="admin-input w-full resize-none p-5" 
                                value={editForm.description} 
                                placeholder="Detail the product specifications..."
                                onChange={e => setEditForm({ ...editForm, description: e.target.value })} 
                            />
                        </div>
                    </div>
                </form>

                <div className="p-8 border-t border-black/5 bg-black/2 flex gap-4">
                    <button onClick={handleSubmit} className="bg-accent-lime text-black rounded-xl flex-1 py-4 group">
                        <span className="flex items-center justify-center gap-2">
                            Save Changes <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                    <button 
                        type="button" 
                        className="bg-black/5 border border-black/5 text-black/60 text-[10px] font-black uppercase tracking-widest px-8 rounded-xl hover:bg-black/10 transition-all" 
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

