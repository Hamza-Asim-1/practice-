import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
    ShieldCheck, 
    XCircle, 
    Search, 
    AlertTriangle, 
    ShieldAlert, 
    Loader2, 
    User,
    Mail,
    Phone,
    Calendar,
    Building2,
    ExternalLink,
    ChevronRight,
    X,
    Beef,
    Edit3,
    Trash2,
    ArrowUpRight,
    CheckCircle2,
    Shield,
    ChevronDown,
    ArrowLeft,
    Plus,
    Eye,
    EyeOff,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

import AdminProductEditModal from '../../components/admin/AdminProductEditModal';
import AdminProductDetailsModal from '../../components/admin/AdminProductDetailsModal';

const API_BASE = import.meta.env.VITE_API_BASE;

// ---------------------------------------------------------------------------
// Create Supplier Modal
// ---------------------------------------------------------------------------
function CreateSupplierModal({ onClose, onCreated }) {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        businessName: '',
        email: '',
        password: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        area: '',
        postcode: '',
        hmcCertNumber: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.firstName || !form.lastName || !form.businessName || !form.email || !form.password || !form.phone || !form.addressLine1 || !form.city || !form.area || !form.postcode) {
            toast.error('Please fill in all required fields.');
            return;
        }
        if (form.password.length < 8) {
            toast.error('Password must be at least 8 characters.');
            return;
        }

        setSubmitting(true);
        const loadingToast = toast.loading('Creating supplier account...');
        try {
            const res = await fetch(`${API_BASE}/admin/users/create-supplier`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    hmcCertNumber: form.hmcCertNumber || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create supplier');
            toast.success(data.message || 'Supplier created successfully', { id: loadingToast });
            onCreated();
            onClose();
        } catch (err) {
            toast.error(err.message || 'Something went wrong', { id: loadingToast });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
                className="relative w-full max-w-lg bg-white border border-black/10 rounded-2xl shadow-2xl shadow-black/10 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-black/5">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-text-cream">Create Supplier Account</h2>
                        <p className="text-[10px] text-black/30 font-bold uppercase tracking-widest mt-1">Account will be activated immediately</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-black/30 hover:text-text-cream hover:bg-black/5 transition-all"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
                    {/* Name Row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/30">First Name *</label>
                            <input
                                name="firstName"
                                value={form.firstName}
                                onChange={handleChange}
                                placeholder="John"
                                className="px-4 py-2.5 bg-black/5 border border-black/10 rounded-xl text-xs font-bold text-text-cream placeholder-black/20 focus:border-accent-lime outline-none transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/30">Last Name *</label>
                            <input
                                name="lastName"
                                value={form.lastName}
                                onChange={handleChange}
                                placeholder="Smith"
                                className="px-4 py-2.5 bg-black/5 border border-black/10 rounded-xl text-xs font-bold text-text-cream placeholder-black/20 focus:border-accent-lime outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Business Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-black/30">Business Name *</label>
                        <input
                            name="businessName"
                            value={form.businessName}
                            onChange={handleChange}
                            placeholder="Al-Madina Halal Butchers"
                            className="px-4 py-2.5 bg-black/5 border border-black/10 rounded-xl text-xs font-bold text-text-cream placeholder-black/20 focus:border-accent-lime outline-none transition-all"
                        />
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/30">Email *</label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="supplier@example.com"
                                className="px-4 py-2.5 bg-black/5 border border-black/10 rounded-xl text-xs font-bold text-text-cream placeholder-black/20 focus:border-accent-lime outline-none transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/30">Phone *</label>
                            <input
                                name="phone"
                                type="tel"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="07123 456789"
                                className="px-4 py-2.5 bg-black/5 border border-black/10 rounded-xl text-xs font-bold text-text-cream placeholder-black/20 focus:border-accent-lime outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-black/30">Password *</label>
                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Min. 8 characters"
                                className="w-full px-4 py-2.5 pr-12 bg-black/5 border border-black/10 rounded-xl text-xs font-bold text-text-cream placeholder-black/20 focus:border-accent-lime outline-none transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(p => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60 transition-colors"
                            >
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>

                    {/* Address Line 1 & Line 2 */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/30">Address Line 1 *</label>
                            <input
                                name="addressLine1"
                                value={form.addressLine1}
                                onChange={handleChange}
                                placeholder="123 Street"
                                className="px-4 py-2.5 bg-black/5 border border-black/10 rounded-xl text-xs font-bold text-text-cream placeholder-black/20 focus:border-accent-lime outline-none transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/30">Address Line 2</label>
                            <input
                                name="addressLine2"
                                value={form.addressLine2}
                                onChange={handleChange}
                                placeholder="Optional"
                                className="px-4 py-2.5 bg-black/5 border border-black/10 rounded-xl text-xs font-bold text-text-cream placeholder-black/20 focus:border-accent-lime outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* City & Area */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/30">City *</label>
                            <input
                                name="city"
                                value={form.city}
                                onChange={handleChange}
                                placeholder="London"
                                className="px-4 py-2.5 bg-black/5 border border-black/10 rounded-xl text-xs font-bold text-text-cream placeholder-black/20 focus:border-accent-lime outline-none transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/30">Area / Region *</label>
                            <input
                                name="area"
                                value={form.area}
                                onChange={handleChange}
                                placeholder="Central"
                                className="px-4 py-2.5 bg-black/5 border border-black/10 rounded-xl text-xs font-bold text-text-cream placeholder-black/20 focus:border-accent-lime outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Postcode & HMC Row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/30">Postcode *</label>
                            <input
                                name="postcode"
                                value={form.postcode}
                                onChange={handleChange}
                                placeholder="E1 6AN"
                                className="px-4 py-2.5 bg-black/5 border border-black/10 rounded-xl text-xs font-bold text-text-cream placeholder-black/20 focus:border-accent-lime outline-none transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/30">HMC Cert No.</label>
                            <input
                                name="hmcCertNumber"
                                value={form.hmcCertNumber}
                                onChange={handleChange}
                                placeholder="Optional"
                                className="px-4 py-2.5 bg-black/5 border border-black/10 rounded-xl text-xs font-bold text-text-cream placeholder-black/20 focus:border-accent-lime outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Active badge note */}
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-lime/5 border border-accent-lime/15">
                        <CheckCircle2 size={13} className="text-accent-lime shrink-0" />
                        <p className="text-[10px] font-bold text-accent-lime/80">This account will be set to <span className="font-black">ACTIVE</span> immediately — no approval required.</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-black/10 text-black/40 hover:text-text-cream hover:border-black/20 text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-3 rounded-xl bg-accent-lime text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-lime/10 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {submitting ? <Loader2 size={13} className="animate-spin" /> : <><Plus size={13} /> Create Account</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function AdminSuppliersPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actioningId, setActioningId] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchSuppliers();
    }, [user]);

    const fetchSuppliers = () => {
        if (!user) return;
        fetch(`${API_BASE}/users/suppliers/applications`, {
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            const items = Array.isArray(data) ? data : [];
            setSuppliers(items);
            setLoading(false);
        })
        .catch(err => {
            console.error('Failed to fetch suppliers:', err);
            setLoading(false);
        });
    };

    const updateSupplierStatus = async (userId, isApproved) => {
        setActioningId(userId);
        const loadingToast = toast.loading(isApproved ? 'Approving partner application...' : 'Suspending partner access...');
        try {
            const res = await fetch(`${API_BASE}/admin/users/${userId}/approve-supplier`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isApproved })
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || 'Failed to update status');
            
            toast.success(data.message || 'Partner status updated successfully', { id: loadingToast });
            fetchSuppliers();
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Failed to update supplier status', { id: loadingToast });
        } finally {
            setActioningId(null);
        }
    };

    const handleGranularStatusUpdate = async (userId, newStatus) => {
        setActioningId(userId);
        const loadingToast = toast.loading(`Transitioning partner to ${newStatus}...`);
        try {
            const res = await fetch(`${API_BASE}/users/suppliers/${userId}/status`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || 'Failed to update status');
            
            toast.success(data.message || `Partner is now ${newStatus}`, { id: loadingToast });
            fetchSuppliers();
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Status transition failed', { id: loadingToast });
        } finally {
            setActioningId(null);
        }
    };

    const handleInspect = (supplier) => {
        navigate(`/admin/suppliers/${supplier.id}`);
    };


    const filtered = suppliers.filter(s => 
        (s.businessName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
        (s.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-in fade-in duration-500">
            {showCreateModal && (
                <CreateSupplierModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={fetchSuppliers}
                />
            )}

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="admin-page-title text-2xl md:text-3xl">Suppliers</h1>
                    <p className="text-black/60 text-[10px] md:text-[11px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                        <Building2 size={12} /> Active Suppliers &amp; Partners
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search suppliers..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-black/5 border border-black/10 rounded-xl text-xs font-bold text-text-cream focus:border-accent-lime outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-accent-lime text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-accent-lime/10 whitespace-nowrap shrink-0"
                    >
                        <Plus size={14} />
                        <span className="hidden sm:inline">Create Supplier</span>
                        <span className="sm:hidden">New</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="admin-card">
                    <LoadingSpinner message="Loading suppliers..." />
                </div>
            ) : filtered.length === 0 ? (
                <div className="admin-card py-24 text-center">
                    <div className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={40} className="text-black/10" />
                    </div>
                    <h3 className="text-lg font-black tracking-tight text-text-cream mb-2 uppercase">No Suppliers Found</h3>
                    <p className="text-black/20 text-xs font-bold uppercase tracking-widest">No suppliers match your search at the moment.</p>
                </div>
            ) : (
                <div className="admin-card p-0 border-black/5 bg-white/80 backdrop-blur-xl">
                    <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-black/5 bg-black/5">
                                    <th className="px-6 md:px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-accent-lime/60">Supplier</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-accent-lime/60 hidden lg:table-cell">Contact</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-accent-lime/60 text-center hidden sm:table-cell">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-accent-lime/60 text-center hidden md:table-cell">Joined</th>
                                    <th className="px-6 md:px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-accent-lime/60 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5">
                                {filtered.map(supplier => {
                                    const isPending = supplier.role === 'CUSTOMER' && supplier.businessName;
                                    const isApproved = supplier.role === 'SUPPLIER_ADMIN';

                                    return (
                                        <tr 
                                            key={supplier.id} 
                                            className="group hover:bg-black/5 transition-colors cursor-pointer"
                                            onClick={() => handleInspect(supplier)}
                                        >
                                            <td className="px-6 md:px-8 py-6">
                                                <div className="flex items-center gap-4 md:gap-5">
                                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center group-hover:border-accent-lime/30 transition-all shrink-0">
                                                        <Building2 size={18} className="text-black/20 group-hover:text-accent-lime transition-colors" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-text-cream font-black text-[13px] md:text-sm tracking-tight mb-1 truncate">{supplier.businessName || 'Unnamed Partner'}</div>
                                                        <div className="flex items-center gap-2">
                                                            {supplier.hmcCertNumber ? (
                                                                <div className="text-[8px] font-black bg-accent-lime/10 text-accent-lime px-2 py-0.5 rounded border border-accent-lime/20 flex items-center gap-1 uppercase tracking-tighter">
                                                                    <Shield size={9} /> {supplier.hmcCertNumber}
                                                                </div>
                                                            ) : (
                                                                <div className="text-[8px] font-black text-black/20 uppercase tracking-widest italic">No Cert</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 hidden lg:table-cell">
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-text-cream/80 text-[11px] font-bold flex items-center gap-2">
                                                        <User size={10} className="text-black/20" />
                                                        {[supplier.firstName, supplier.lastName].filter(Boolean).join(' ') || 'N/A'}
                                                    </div>
                                                    <div className="text-black/30 text-[10px] font-medium flex items-center gap-2">
                                                        <Mail size={10} className="text-black/10" />
                                                        {supplier.email || 'no-email@recorded.com'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center hidden sm:table-cell">
                                                <div className="flex justify-center">
                                                    {supplier.supplierStatus === 'ACTIVE' && <span className="inline-block status-badge poultry scale-75 md:scale-90">ACTIVE</span>}
                                                    {supplier.supplierStatus === 'PENDING' && <span className="inline-block status-badge veal scale-75 md:scale-90">PENDING</span>}
                                                    {supplier.supplierStatus === 'SUSPENDED' && <span className="inline-block status-badge bg-red-500/10 text-red-500 border-red-500/20 uppercase font-black text-[8px] md:text-[9px] tracking-widest px-2 md:px-3 py-1 rounded-md border scale-75 md:scale-90">SUSPENDED</span>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center hidden md:table-cell">
                                                <div className="text-black/60 text-[11px] font-mono uppercase tracking-tighter">
                                                    {new Date(supplier.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-6 md:px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 md:gap-3">
                                                    <div className="relative min-w-[100px] md:min-w-[120px]" onClick={e => e.stopPropagation()}>
                                                        <select 
                                                            value={supplier.supplierStatus}
                                                            disabled={actioningId === supplier.id}
                                                            onChange={(e) => handleGranularStatusUpdate(supplier.id, e.target.value)}
                                                            className={`
                                                                w-full text-[9px] font-black uppercase tracking-widest pl-3 pr-8 py-2 rounded-lg border appearance-none outline-none cursor-pointer transition-all text-left
                                                                ${supplier.supplierStatus === 'ACTIVE' ? 'bg-accent-lime/10 text-accent-lime border-accent-lime/20' : 
                                                                  supplier.supplierStatus === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                                                  'bg-red-500/10 text-red-500 border-red-500/20'}
                                                                hover:brightness-125 disabled:opacity-50 disabled:cursor-not-allowed
                                                            `}
                                                        >
                                                            <option value="PENDING" className="bg-white text-black">Pending</option>
                                                            <option value="ACTIVE" className="bg-white text-black">Active</option>
                                                            <option value="SUSPENDED" className="bg-white text-black">Suspended</option>
                                                        </select>
                                                        <ChevronDown 
                                                            size={12} 
                                                            className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60
                                                                ${supplier.supplierStatus === 'ACTIVE' ? 'text-accent-lime' : 
                                                                  supplier.supplierStatus === 'PENDING' ? 'text-amber-500' : 
                                                                  'text-red-500'}
                                                            `}
                                                        />
                                                    </div>

                                                    <button 
                                                        onClick={() => handleInspect(supplier)}
                                                        title="Inspect Registry Details"
                                                        className="h-9 w-9 rounded-xl border border-black/5 text-black/40 hover:text-text-cream hover:border-black/20 hover:bg-black/5 transition-all flex items-center justify-center shrink-0"
                                                    >
                                                        <ArrowUpRight size={16} />
                                                    </button>
                                                    
                                                    {isPending && (
                                                        <>
                                                            <button 
                                                                onClick={() => updateSupplierStatus(supplier.id, true)} 
                                                                disabled={actioningId === supplier.id}
                                                                className="h-9 px-4 rounded-xl bg-accent-lime text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2 shadow-lg shadow-accent-lime/10"
                                                            >
                                                                {actioningId === supplier.id ? <Loader2 size={14} className="animate-spin" /> : <>Approve <CheckCircle2 size={14} /></>}
                                                            </button>
                                                            <button 
                                                                onClick={() => updateSupplierStatus(supplier.id, false)}
                                                                disabled={actioningId === supplier.id} 
                                                                className="h-9 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                                            >
                                                                {actioningId === supplier.id ? <Loader2 size={14} className="animate-spin" /> : 'Reject'}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    );
}
