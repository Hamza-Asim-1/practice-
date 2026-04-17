import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
    Users, 
    Search, 
    Filter, 
    ChevronRight, 
    User, 
    Mail, 
    Phone, 
    Calendar,
    ShoppingBag,
    MapPin,
    ArrowUpRight,
    X,
    ShieldCheck,
    Eye,
    Loader2
} from 'lucide-react';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const API_BASE = import.meta.env.VITE_API_BASE;

const AdminCustomersPage = () => {
    const { user } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingProfile, setLoadingProfile] = useState(null);
    const [viewingCustomer, setViewingCustomer] = useState(null);

    const fetchCustomers = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/customers`, {
                credentials: 'include'
            });
            const d = await res.json();
            setCustomers(Array.isArray(d) ? d : []);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [user]);

    const handleViewProfile = async (id) => {
        setLoadingProfile(id);
        try {
            const res = await fetch(`${API_BASE}/customers/${id}`, {
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                setViewingCustomer(data);
            }
        } catch (e) { 
            console.error('Fetch profile error:', e);
        } finally {
            setLoadingProfile(null);
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="admin-page-header flex-col md:flex-row gap-6 md:items-end">
                <div className="flex-1">
                    <h1 className="admin-page-title text-2xl md:text-3xl">Customers</h1>
                    <p className="text-black/60 text-[10px] md:text-[11px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                        <Users size={12} /> Manage your customer base
                    </p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-initial">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={16} />
                        <input 
                            type="text" 
                            placeholder="Find ID or email..." 
                            className="bg-black/5 border border-black/10 rounded-xl pl-12 pr-4 py-3 text-xs font-bold text-text-cream focus:border-accent-lime outline-none w-full md:w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="admin-card">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-6">
                        <button className="text-accent-lime text-[11px] font-black uppercase tracking-widest border-b-2 border-accent-lime pb-2">Active Accounts</button>
                        <button className="text-black/30 text-[11px] font-black uppercase tracking-widest pb-2 hover:text-text-cream transition-colors">Inactive</button>
                    </div>
                </div>

                {loading ? (
                    <LoadingSpinner message="Loading customers..." />
                ) : (
                    <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Customer Name / Email</th>
                                    <th className="hidden sm:table-cell">Activity</th>
                                    <th className="hidden lg:table-cell">Onboarding</th>
                                    <th className="text-right">Portal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map(c => (
                                    <tr key={c.id} className="group/row">
                                        <td>
                                            <div className="flex items-center gap-4">
                                                <div className="hidden xs:flex w-10 h-10 rounded-xl bg-black/5 border border-black/5 items-center justify-center group-hover/row:bg-accent-lime/10 group-hover/row:border-accent-lime/20 transition-all shrink-0">
                                                    <User size={18} className="text-black/20 group-hover/row:text-accent-lime transition-colors" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[12px] md:text-[13px] font-black text-text-cream truncate">
                                                        {(c.firstName || c.lastName) ? `${c.firstName || ''} ${c.lastName || ''}` : 'Unnamed identity'}
                                                    </span>
                                                    <span className="text-[10px] text-black/30 italic truncate">{c.user?.email || 'Email missing'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hidden sm:table-cell">
                                            <span className={`status-badge ${c.orders?.length > 5 ? 'beef' : c.orders?.length > 0 ? 'poultry' : 'veal'}`}>
                                                {c.orders?.length || 0} Orders
                                            </span>
                                        </td>
                                        <td className="hidden lg:table-cell">
                                            <div className="text-[11px] font-bold text-black/30 uppercase tracking-tighter">
                                                {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'NO-DATA'}
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <div className="flex items-center justify-end">
                                                <button 
                                                    onClick={() => handleViewProfile(c.id)}
                                                    disabled={loadingProfile === c.id}
                                                    title="View Customer Dossier"
                                                    className="h-9 w-9 rounded-xl border border-black/5 text-black/40 hover:text-text-cream hover:border-black/20 hover:bg-black/5 transition-all flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {loadingProfile === c.id ? (
                                                        <Loader2 size={16} className="animate-spin text-accent-lime" />
                                                    ) : (
                                                        <Eye size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {customers.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-20 text-black/20 italic font-medium">No customer identities detected in active cache.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* View Profile Modal */}
            {viewingCustomer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 lg:p-24 overflow-hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingCustomer(null)}></div>
                    <div className="bg-white border border-black/10 rounded-3xl p-5 md:p-8 shadow-2xl shadow-black/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-[101] animate-in zoom-in duration-300 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-black/10 [&::-webkit-scrollbar-track]:bg-transparent">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-accent-lime/10 flex items-center justify-center text-accent-lime">
                                    <User size={20} />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-text-cream m-0">Customer Profile</h3>
                            </div>
                            <button onClick={() => setViewingCustomer(null)} className="text-black/20 hover:text-text-cream transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-4 flex items-center gap-2">
                                    <ShieldCheck size={12} /> Core Profile
                                </h4>
                                 <div className="space-y-4 bg-black/5 border border-black/5 rounded-2xl p-5">
                                    <div>
                                        <label className="text-[9px] font-black uppercase tracking-widest text-black/10 block mb-1">Account Holder</label>
                                        <p className="text-lg font-black tracking-tight text-text-cream m-0">{viewingCustomer.firstName} {viewingCustomer.lastName}</p>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black uppercase tracking-widest text-black/10 block mb-1">Email Address</label>
                                        <p className="text-[11px] font-bold text-black/60 m-0">{viewingCustomer.user?.email || "Email missing"}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/5">
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-black/10 block mb-1">Phone Number</label>
                                            <p className="text-[11px] font-bold text-black/60 m-0">{viewingCustomer.phone || "Not Set"}</p>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-black/10 block mb-1">Joined Date</label>
                                            <p className="text-[11px] font-bold text-black/60 m-0 uppercase tracking-tighter">{new Date(viewingCustomer.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-4 flex items-center gap-2">
                                    <MapPin size={12} /> Saved Addresses
                                </h4>
                                <div className="space-y-3">
                                    {viewingCustomer.addresses?.length > 0 ? viewingCustomer.addresses.map(a => (
                                        <div key={a.id} className="p-4 bg-black/5 border border-black/5 rounded-xl flex items-start gap-3 group/addr">
                                            <MapPin size={14} className="text-black/20 mt-0.5 group-hover/addr:text-accent-lime transition-colors" />
                                            <p className="text-[11px] font-medium text-black/80 leading-relaxed m-0 italic">
                                                {a.street}, {a.city}, {a.postcode}
                                            </p>
                                        </div>
                                    )) : (
                                        <div className="p-8 bg-black/5 border border-dashed border-black/10 rounded-xl text-center">
                                            <p className="text-[11px] font-bold text-black/20 uppercase tracking-widest m-0">No Addresses Registered</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <h4 className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-4 flex items-center gap-2">
                        <ShoppingBag size={12} /> Order History
                        </h4>
                        <div className="bg-black/5 border border-black/5 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="admin-table text-sm">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-4">Order ID</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Total</th>
                                            <th className="px-6 py-4 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {viewingCustomer.orders?.map(o => (
                                            <tr key={o.id} className="border-t border-black/5">
                                                <td className="px-6 py-4 font-mono text-[10px] text-black/40 tracking-widest uppercase">{o.id.slice(0, 8)}</td>
                                                <td className="px-6 py-4 text-[11px] font-bold text-black/60 uppercase">{new Date(o.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 font-black text-text-cream">£{Number(o.totalAmount).toFixed(2)}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`status-badge text-[9px] ${
                                                        o.status === 'CONFIRMED' || o.status === 'DELIVERED' ? 'beef' : 
                                                        o.status === 'PENDING_PAYMENT' || o.status === 'AWAITING_PAYMENT' || o.status === 'IN_PREPARATION' || o.status === 'READY_FOR_PICKUP' || o.status === 'OUT_FOR_DELIVERY' ? 'poultry' : 
                                                        'veal'
                                                    }`}>
                                                        {o.status?.replace('_', ' ')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!viewingCustomer.orders || viewingCustomer.orders.length === 0) && (
                                            <tr>
                                                <td colSpan="4" className="text-center py-10 text-black/10 italic text-[11px]">No transaction history detected.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCustomersPage;
