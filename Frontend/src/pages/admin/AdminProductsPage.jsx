import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
    Plus, 
    Search, 
    Filter, 
    MoreVertical, 
    Edit3, 
    Trash2, 
    Package, 
    Tag, 
    Database,
    AlertCircle,
    ChevronRight,
    ArrowUpRight,
    Beef,
    X,
    Clock,
    CheckCircle2,
    ShoppingBag,
    Upload,
    Activity
} from 'lucide-react';
import SpecificationsManager from '../../components/admin/SpecificationsManager';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

import AdminProductEditModal from '../../components/admin/AdminProductEditModal';
import Tooltip from '../../components/common/Tooltip';
import AdminProductDetailsModal from '../../components/admin/AdminProductDetailsModal';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';

const API_BASE = import.meta.env.VITE_API_BASE;

const AdminProductsPage = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isCreating, setIsCreating] = useState(false); // Added loading state
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ 
        name: '', 
        categoryId: '', 
        category: '', 
        basePrice: '', 
        description: '', 
        imageUrl: '',
        isHmcCertified: true,
        isFeatured: false,
        quantity: 0,
        lowStockThreshold: 5,
        specifications: {} 
    });

    // Edit Modal State
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [viewingProduct, setViewingProduct] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchProducts = () => {
        setLoading(true);
        // Fetch all products (including pending) for admin panel
        fetch(`${API_BASE}/products?all=true&limit=1000`)
            .then(r => r.json())
            .then(res => {
                // Backend returns { data, total }
                const items = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
                setProducts(items);
                setLoading(false);
            })
            .catch(() => { setLoading(false); });
    };

    const fetchCategories = () => {
        fetch(`${API_BASE}/categories`)
            .then(r => r.json())
            .then(data => {
                setCategories(data);
                if (data.length > 0 && !form.categoryId) {
                    setForm(f => ({ ...f, categoryId: data[0].id, category: data[0].name }));
                }
            })
            .catch(() => { });
    };

    useEffect(() => { 
        fetchProducts(); 
        fetchCategories();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsCreating(true); // Start loading
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('categoryId', form.categoryId);
            formData.append('category', form.category);
            formData.append('basePrice', form.basePrice);
            formData.append('description', form.description);
            formData.append('imageUrl', form.imageUrl);
            formData.append('isHmcCertified', String(form.isHmcCertified));
            formData.append('isFeatured', String(form.isFeatured));
            formData.append('quantity', String(form.quantity));
            formData.append('lowStockThreshold', String(form.lowStockThreshold));
            formData.append('specifications', JSON.stringify(form.specifications));
            
            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            await fetch(`${API_BASE}/products`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            setForm({ 
                name: '', 
                categoryId: categories[0]?.id || '', 
                category: categories[0]?.name || '', 
                basePrice: '', 
                description: '', 
                imageUrl: '',
                isHmcCertified: true,
                isFeatured: false,
                quantity: 0,
                lowStockThreshold: 5,
                specifications: {} 
            });
            setSelectedFile(null);
            fetchProducts();
        } catch (error) {
            console.error('Create failed:', error);
        } finally {
            setIsCreating(false); // End loading
        }
    };

    const handleDelete = async () => {
        const { id } = deleteModal;
        setIsDeleting(true);
        try {
            await fetch(`${API_BASE}/products/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            setDeleteModal({ isOpen: false, id: null });
            fetchProducts();
        } catch (error) {
            console.error('Delete failed:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const startEdit = (product) => {
        setSelectedProduct(product);
    };

    const handleUpdate = async (updatedData, file) => {
        try {
            const formData = new FormData();
            Object.entries(updatedData).forEach(([key, value]) => {
                if (key === 'stock' || key === 'specifications') {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, String(value));
                }
            });

            if (file) {
                formData.append('file', file);
            }

            const res = await fetch(`${API_BASE}/products/${selectedProduct.id}`, {
                method: 'PATCH',
                credentials: 'include',
                body: formData
            });
            const updatedProduct = await res.json();
            
            setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
            if (viewingProduct?.id === updatedProduct.id) {
                setViewingProduct(updatedProduct);
            }
            
            setSelectedProduct(null);
            fetchProducts();
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    const [tab, setTab] = useState('ALL');

    const handleApprove = async (id) => {
        const res = await fetch(`${API_BASE}/products/${id}/approve`, {
            method: 'POST',
            credentials: 'include'
        });
        const updatedProduct = await res.json();
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        if (viewingProduct?.id === updatedProduct.id) {
            setViewingProduct(updatedProduct);
        }
        fetchProducts();
    };

    const handleReject = async (id) => {
        const res = await fetch(`${API_BASE}/products/${id}/reject`, {
            method: 'POST',
            credentials: 'include'
        });
        const updatedProduct = await res.json();
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        if (viewingProduct?.id === updatedProduct.id) {
            setViewingProduct(updatedProduct);
        }
        fetchProducts();
    };

    const filteredProducts = products.filter(p => {
        // Tab Filtering
        if (tab === 'PENDING' && (p.approvalStatus !== 'PENDING' && !p.draftData)) return false;
        if (tab === 'REJECTED' && p.approvalStatus !== 'REJECTED') return false;
        if (tab === 'ARCHIVED' && p.status !== 'ARCHIVED') return false;

        // Search Filtering
        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase();
            const nameMatch = p.name.toLowerCase().includes(query);
            const categoryMatch = p.category && p.category.toLowerCase().includes(query);
            const idMatch = p.id.toLowerCase().includes(query);

            if (!nameMatch && !categoryMatch && !idMatch) return false;
        }

        // Category Filtering
        if (selectedCategory !== 'ALL' && p.categoryId !== selectedCategory) return false;

        return true;
    });

    const pendingCount = products.filter(p => p.approvalStatus === 'PENDING' || p.draftData).length;

    return (
        <div className="animate-in fade-in duration-500 max-w-full overflow-hidden">
            <div className="admin-page-header flex gap-6 items-end mb-2 overflow-hidden border-none pb-2">
                <div className="flex-1">
                    <h1 className="admin-page-title text-2xl md:text-3xl">Products</h1>
                    <p className="text-black/60 text-[10px] md:text-[11px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                        <ShoppingBag size={12} /> Manage your catalogue
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-8">
                {/* Product Creation Card */}
                <div className="w-full">
                    <div className="admin-card border-l-4 border-l-accent-lime">
                        <h3 className="text-xs font-black uppercase tracking-widest text-black/40 mb-6 flex items-center gap-2">
                            <Plus size={14} className="text-accent-lime" /> Add New Product
                        </h3>
                        
                        <form onSubmit={handleCreate} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Left Column: Core Details */}
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block">Product Name *</label>
                                        <input 
                                            className="admin-input w-full" 
                                            placeholder="e.g. Premium Beef Fillet" 
                                            value={form.name} 
                                            onChange={e => setForm({ ...form, name: e.target.value })} 
                                            required 
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block">Category *</label>
                                        <select 
                                            className="admin-input w-full" 
                                            value={form.categoryId} 
                                            onChange={e => {
                                                const selectedId = e.target.value;
                                                const selectedCat = categories.find(c => c.id === selectedId);
                                                setForm({ ...form, categoryId: selectedId, category: selectedCat ? selectedCat.name : form.category });
                                            }}
                                            required
                                        >
                                            <option value="">Select</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block">Price (£) *</label>
                                        <input 
                                            className="admin-input w-full" 
                                            placeholder="0.00" 
                                            type="number" 
                                            step="0.01" 
                                            value={form.basePrice} 
                                            onChange={e => setForm({ ...form, basePrice: e.target.value })} 
                                            required 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block">Short Description</label>
                                    <textarea 
                                        className="admin-input w-full min-h-[120px] py-4 resize-none" 
                                        placeholder="Describe the cut, origin, or preparation details that customers should know..." 
                                        value={form.description} 
                                        onChange={e => setForm({ ...form, description: e.target.value })} 
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block">Product Media</label>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3">
                                            <input 
                                                className="admin-input flex-1" 
                                                placeholder="Paste an image URL..." 
                                                value={form.imageUrl} 
                                                onChange={e => setForm({ ...form, imageUrl: e.target.value })} 
                                            />
                                            <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">OR</span>
                                            <label className="bg-black/5 hover:bg-black/10 border border-black/5 rounded-xl px-4 py-3 cursor-pointer transition-all flex items-center justify-center gap-2 group/upload">
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={e => setSelectedFile(e.target.files[0])}
                                                />
                                                <Upload size={14} className={`${selectedFile ? 'text-accent-lime' : 'text-black/40'} group-hover/upload:scale-110 transition-transform`} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-black/60">
                                                    {selectedFile ? 'File Selected' : 'Upload File'}
                                                </span>
                                            </label>
                                        </div>
                                        {selectedFile && (
                                            <div className="flex items-center justify-between bg-accent-lime/10 border border-accent-lime/20 rounded-xl px-4 py-2">
                                                <span className="text-[9px] font-bold text-accent-lime uppercase tracking-widest truncate max-w-[200px]">
                                                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                                </span>
                                                <button onClick={() => setSelectedFile(null)} className="text-black/40 hover:text-red-500 transition-colors">
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={isCreating}
                                        className={`bg-accent-lime text-black rounded-2xl w-full py-5 font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-xl ${isCreating ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-[1.01] active:scale-[0.99] shadow-accent-lime/20'}`}
                                    >
                                        {isCreating ? (
                                            <>Syncing with Store... <Activity size={18} className="animate-spin" /></>
                                        ) : (
                                            <>Add New Product to Store <Plus size={18} /></>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Right Column: Configurations & Inventory */}
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="admin-card p-4! border-l-2 border-l-blue-500 bg-black/2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-black/20 mb-3 block">Compliance</label>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="checkbox" 
                                                id="hmc"
                                                className="w-5 h-5 accent-accent-lime"
                                                checked={form.isHmcCertified}
                                                onChange={e => setForm({ ...form, isHmcCertified: e.target.checked })}
                                            />
                                            <label htmlFor="hmc" className="text-[11px] font-black text-black/60 cursor-pointer uppercase tracking-widest">HMC Certified</label>
                                        </div>
                                    </div>
                                    <div className="admin-card p-4! border-l-2 border-l-purple-500 bg-black/2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-black/20 mb-3 block">Promotion</label>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="checkbox" 
                                                id="featured"
                                                className="w-5 h-5 accent-accent-lime"
                                                checked={form.isFeatured}
                                                onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                                            />
                                            <label htmlFor="featured" className="text-[11px] font-black text-black/60 cursor-pointer uppercase tracking-widest">Featured Item</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="admin-card p-6! border-l-2 border-l-orange-500">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-5 block">Inventory Control</label>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-black/20 mb-2 block">Initial Qty (kg)</label>
                                            <input 
                                                type="number" 
                                                className="admin-input w-full" 
                                                value={form.quantity}
                                                onChange={e => setForm({ ...form, quantity: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-black/20 mb-2 block">Low Threshold</label>
                                            <input 
                                                type="number" 
                                                className="admin-input w-full" 
                                                value={form.lowStockThreshold}
                                                onChange={e => setForm({ ...form, lowStockThreshold: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-black/2 rounded-3xl p-1">
                                    <SpecificationsManager 
                                        specifications={form.specifications}
                                        theme="light"
                                        compact={true}
                                        onChange={(specs) => setForm({ ...form, specifications: specs })}
                                    />
                                </div>
                            </div>
                        </form>

                    </div>
                </div>

                {/* Products Table */}
                <div className="w-full">
                    <div className="admin-card">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div className="flex items-center gap-6 overflow-x-auto pb-2 md:pb-0">
                                <button 
                                    onClick={() => setTab('ALL')}
                                    className={`${tab === 'ALL' ? 'text-accent-lime border-accent-lime' : 'text-black/30 border-transparent'} text-[11px] font-black uppercase tracking-widest border-b-2 pb-2 transition-all whitespace-nowrap`}
                                >
                                    All Products
                                </button>
                                <button 
                                    onClick={() => setTab('PENDING')}
                                    className={`${tab === 'PENDING' ? 'text-accent-lime border-accent-lime' : 'text-black/30 border-transparent'} text-[11px] font-black uppercase tracking-widest border-b-2 pb-2 transition-all flex items-center gap-2 whitespace-nowrap`}
                                >
                                    Pending Approval {pendingCount > 0 && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
                                </button>
                                <button 
                                    onClick={() => setTab('REJECTED')}
                                    className={`${tab === 'REJECTED' ? 'text-accent-lime border-accent-lime' : 'text-black/30 border-transparent'} text-[11px] font-black uppercase tracking-widest border-b-2 pb-2 transition-all whitespace-nowrap`}
                                >
                                    Rejected
                                </button>
                                <button 
                                    onClick={() => setTab('ARCHIVED')}
                                    className={`${tab === 'ARCHIVED' ? 'text-accent-lime border-accent-lime' : 'text-black/30 border-transparent'} text-[11px] font-black uppercase tracking-widest border-b-2 pb-2 transition-all whitespace-nowrap`}
                                >
                                    Archived
                                </button>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={16} />
                                    <input 
                                        type="text"
                                        placeholder="Search catalogue..."
                                        className="admin-input pl-12 w-full"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select 
                                    className="admin-input w-full sm:w-auto"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="ALL">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Product Name</th>
                                        <th className="hidden md:table-cell">Category</th>
                                        <th className="text-center hidden lg:table-cell">HMC</th>
                                        <th className="text-center hidden sm:table-cell">Stock</th>
                                        <th>Price</th>
                                        <th className="hidden md:table-cell">Status</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7">
                                                <LoadingSpinner message="Loading products..." />
                                            </td>
                                        </tr>
                                    ) : filteredProducts.length > 0 ? (
                                        filteredProducts.map(p => (
                                            <tr 
                                                key={p.id} 
                                                className="group/row cursor-pointer select-none"
                                                onClick={() => setViewingProduct(p)}
                                            >
                                                <td>
                                                    <div className="flex flex-col min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[12px] md:text-[13px] font-black text-text-cream truncate group-hover/row:text-accent-lime transition-colors">
                                                                {p.name || 'Unnamed Asset'}
                                                            </span>
                                                            {p.draftData && (
                                                                <div className="hidden sm:flex items-center gap-1 bg-blue-500/10 text-blue-500 text-[7px] font-black uppercase px-2 py-0.5 rounded-md border border-blue-500/20">
                                                                    <Clock size={8} /> Draft
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-[9px] text-black/20 uppercase tracking-widest font-bold">SKU-{p.id?.slice(0, 6) || 'XXXXXX'}</span>
                                                    </div>
                                                </td>
                                                <td className="hidden md:table-cell">
                                                    <span className={`status-badge ${((p.categoryObj?.name || p.category) || 'other').toLowerCase()}`}>
                                                        {p.categoryObj?.name || p.category || 'General'}
                                                    </span>
                                                </td>
                                                <td className="text-center hidden lg:table-cell">
                                                    {p.isHmcCertified ? (
                                                        <span className="inline-flex items-center gap-1 bg-accent-lime/10 text-accent-lime text-[8px] font-black uppercase px-2 py-0.5 rounded border border-accent-lime/20">
                                                            Certified
                                                        </span>
                                                    ) : (
                                                        <span className="text-[8px] font-black text-black/20 uppercase tracking-widest italic">N/A</span>
                                                    )}
                                                </td>
                                                <td className="text-center hidden sm:table-cell">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[11px] font-black text-text-cream">{Number(p.stock?.quantity || 0).toFixed(1)}kg</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="text-[12px] md:text-[13px] font-black text-text-cream whitespace-nowrap">£{Number(p.basePrice || 0).toFixed(2)}</span>
                                                </td>
                                                <td className="hidden md:table-cell">
                                                    {p.approvalStatus === 'PENDING' || p.draftData ? (
                                                        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                                            <Tooltip text={p.draftData ? "Approve Draft" : "Approve Product"}>
                                                                <button 
                                                                    onClick={() => handleApprove(p.id)}
                                                                    className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-500/10"
                                                                >
                                                                    <CheckCircle2 size={14} />
                                                                </button>
                                                            </Tooltip>
                                                            <Tooltip text={p.draftData ? "Reject Draft" : "Reject Product"}>
                                                                <button 
                                                                    onClick={() => handleReject(p.id)}
                                                                    className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </Tooltip>
                                                        </div>
                                                    ) : (
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${p.approvalStatus === 'APPROVED' ? 'text-accent-lime' : 'text-red-500/50'}`}>
                                                            {p.approvalStatus || 'UNKNOWN'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="text-right">
                                                    <div className="flex items-center justify-end gap-2 transition-opacity" onClick={e => e.stopPropagation()}>
                                                        <Tooltip text="Edit Product">
                                                            <button 
                                                                onClick={() => startEdit(p)}
                                                                className="w-8 h-8 rounded-lg bg-black/5 border border-black/5 flex items-center justify-center text-black/30 hover:text-accent-lime hover:bg-black/10 transition-all"
                                                            >
                                                                <Edit3 size={14} />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip text="Delete Product">
                                                            <button 
                                                                onClick={() => setDeleteModal({ isOpen: true, id: p.id })}
                                                                className="w-8 h-8 rounded-lg bg-black/5 border border-black/5 flex items-center justify-center text-black/30 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center py-20 text-black/20 italic font-medium">No products found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal Override */}
            {selectedProduct && (
                <AdminProductEditModal 
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onSave={handleUpdate}
                />
            )}

            {viewingProduct && (
                <AdminProductDetailsModal 
                    product={viewingProduct}
                    onClose={() => setViewingProduct(null)}
                />
            )}

            <DeleteConfirmModal 
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                title="Purge Product"
                message="Are you sure you want to remove this product from the catalogue? This will also affect any pending inventory stock."
            />
        </div>
    );
};

export default AdminProductsPage;
