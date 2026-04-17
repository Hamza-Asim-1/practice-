import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, Loader2, Edit2, Trash2, Search, Filter, Clock, ShieldCheck } from 'lucide-react';
import SupplierProductModal from '../../components/supplier/SupplierProductModal';
import { toast } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE;

export default function SupplierInventoryTab() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchInventory = () => {
        if (!user) return;
        setLoading(true);
        fetch(`${API_BASE}/suppliers/inventory`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                setProducts(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch inventory:', err);
                setLoading(false);
                toast.error('Failed to sync inventory');
            });
    };

    useEffect(() => {
        fetchInventory();
    }, [user]);


    const handleUpdateProduct = async (productData) => {
        try {
            setIsSubmitting(true);
            const formData = new FormData();
            const { file, stock, ...rest } = productData;
            
            Object.keys(rest).forEach(key => formData.append(key, rest[key]));
            formData.append('quantity', stock.quantity);
            formData.append('lowStockThreshold', stock.lowStockThreshold);
            
            if (file) {
                formData.append('file', file);
            }

            const res = await fetch(`${API_BASE}/products/${selectedProduct.id}`, {
                method: 'PATCH',
                credentials: 'include',
                body: formData
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Modification failed');
            }
            
            toast.success('Product updated successfully.');
            fetchInventory();
            setIsModalOpen(false);
            setSelectedProduct(null);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm('Are you sure you want to decommission this asset? This will hide it from the catalog.')) return;
        
        try {
            const res = await fetch(`${API_BASE}/products/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!res.ok) throw new Error('Decommissioning failed');
            
            toast.success('Asset decommissioned.');
            fetchInventory();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.categoryObj?.name || p.category).toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="py-20 flex flex-col items-center justify-center text-black/20">
            <Loader2 size={32} className="animate-spin mb-4" />
            <p className="text-xs font-black uppercase tracking-widest">Scanning Storehouse...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder="Search inventory registry..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-black/5 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:border-black outline-none transition-all placeholder:text-black/20"
                    />
                </div>
                <div className="flex gap-4">
                    <button className="h-14 px-6 rounded-2xl border border-black/5 bg-white text-black/40 hover:text-black hover:border-black/20 transition-all flex items-center gap-2">
                        <Filter size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">Filter</span>
                    </button>
                </div>
            </div>

            {/* Inventory List */}
            {filteredProducts.length === 0 ? (
                <div className="py-24 text-center border border-dashed border-black/10 rounded-[3rem] bg-white">
                    <div className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-6">
                        <Package size={32} className="text-black/10" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-2">No Assets Found</h3>
                    <p className="text-sm text-black/40 max-w-xs mx-auto">Your inventory is currently empty. Start by adding a new product.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="group bg-white border border-black/5 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-black/20 hover:shadow-2xl hover:-translate-y-1">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black/5 border border-black/5 shrink-0">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-black/10">
                                            <Package size={32} />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${
                                            product.approvalStatus === 'APPROVED' ? 'bg-accent-lime text-black' : 
                                            product.approvalStatus === 'PENDING' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                            {product.approvalStatus}
                                        </span>
                                        {product.draftData && (
                                            <span className="text-[8px] font-black bg-blue-100 text-blue-600 px-2 py-1 rounded-md uppercase tracking-wider">
                                                Pending Changes
                                            </span>
                                        )}
                                        <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">{product.categoryObj?.name || product.category}</span>
                                    </div>
                                    <h4 className="text-lg font-black uppercase tracking-tighter text-black flex items-center gap-3">
                                        {product.name}
                                        {product.isHmcCertified && (
                                            <div className="w-5 h-5 rounded-md bg-accent-lime text-black flex items-center justify-center shadow-sm" title="HMC Certified">
                                                <ShieldCheck size={12} />
                                            </div>
                                        )}
                                    </h4>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="text-[11px] font-mono text-black/40">£{Number(product.basePrice).toFixed(2)} / unit</div>
                                        <div className={`text-[11px] font-black uppercase tracking-widest ${
                                            Number(product.stock?.quantity || 0) <= Number(product.stock?.lowStockThreshold || 5) 
                                                ? 'text-red-500 animate-pulse' 
                                                : 'text-black/40'
                                        }`}>
                                            {Number(product.stock?.quantity || 0)} Kg In Stock
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 self-end md:self-center">
                                {product.approvalStatus === 'PENDING' && (
                                    <div className="flex items-center gap-2 text-amber-500 mr-4">
                                        <Clock size={14} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Validation Ongoing</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <SupplierProductModal 
                    product={selectedProduct}
                    isSubmitting={isSubmitting}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleUpdateProduct}
                />
            )}
        </div>
    );
}
