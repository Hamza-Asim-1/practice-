import React, { useState, useEffect, useCallback } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Loader2, Building2, User, Phone, Mail, 
    ShieldCheck, AlertCircle, ChevronRight, ChevronDown, ShoppingBag, ShieldAlert,
    Trash2, Edit3, CheckCircle2, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';

const API_BASE = import.meta.env.VITE_API_BASE;

const AdminSupplierDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [supplier, setSupplier] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(false);
    
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchSupplier = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/users/${id}`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to load partner specifics');
            const data = await res.json();
            
            // Map the Prisma user object to the structure expected by the component
            const mappedSupplier = {
                id: data.id,
                supplierId: data.supplier?.id,
                email: data.email,
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                businessName: data.supplier?.name || 'Unnamed Partner',
                phone: data.supplier?.phone || data.customer?.phone || '',
                role: data.role,
                supplierStatus: data.supplier?.status || 'PENDING',
                hmcCertNumber: data.supplier?.hmcCertNumber,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
            };
            
            setSupplier(mappedSupplier);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchOrders = useCallback(async (supplierId) => {
        if (!supplierId) return;
        setLoadingOrders(true);
        try {
            const res = await fetch(`${API_BASE}/orders?supplierId=${supplierId}`, {
                credentials: 'include'
            });
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Order retrieval failed:', err);
        } finally {
            setLoadingOrders(false);
        }
    }, []);

    useEffect(() => {
        fetchSupplier();
    }, [fetchSupplier]);

    useEffect(() => {
        if (supplier?.supplierId) {
            fetchOrders(supplier.supplierId);
        }
    }, [supplier?.supplierId, fetchOrders]);

    const handleOrderStatusUpdate = async (orderId, newStatus) => {
        const loadingToast = toast.loading(`Updating order status to ${newStatus}...`);
        try {
            const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error('Order status update failed');
            
            toast.success('Order status synchronized', { id: loadingToast });
            fetchOrders(supplier.supplierId);
        } catch (err) {
            toast.error(err.message, { id: loadingToast });
        }
    };

    const handleDeleteOrder = async () => {
        setIsDeleting(true);
        const loadingToast = toast.loading('Purging order from ledger...');
        try {
            const res = await fetch(`${API_BASE}/orders/${deleteModal.id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Order deletion failed');
            
            toast.success('Order removed successfully', { id: loadingToast });
            setDeleteModal({ isOpen: false, id: null });
            fetchOrders(supplier.supplierId);
        } catch (err) {
            toast.error(err.message, { id: loadingToast });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSupplierStatus = async (newStatus) => {
        const loadingToast = toast.loading(`Transitioning partner to ${newStatus}...`);
        try {
            const res = await fetch(`${API_BASE}/users/suppliers/${supplier.id}/status`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error('Status transition failed');
            
            const result = await res.json();
            toast.success(result.message, { id: loadingToast });
            fetchSupplier(); // Refresh data
        } catch (err) {
            toast.error(err.message, { id: loadingToast });
        }
    };

    if (loading) {
        return <LoadingSpinner fullPage message="Synchronizing partner credentials..." />;
    }

    if (!supplier) {
        return (
            <div className="flex-1 p-8">
                <button onClick={() => navigate('/admin/suppliers')} className="flex items-center gap-2 text-black/40 hover:text-text-cream transition-colors mb-8">
                    <ArrowLeft size={16} /> Back to Directory
                </button>
                <div className="admin-card py-20 text-center">
                    <AlertCircle className="mx-auto text-red-500/50 mb-4" size={48} />
                    <h2 className="text-xl font-black text-text-cream">Partner Not Found</h2>
                    <p className="text-black/40 text-sm mt-2">The requested supplier ID does not exist in our registry.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen">
            {/* Header / Breadcrumb */}
            <div className="p-8 border-b border-black/5 flex justify-between items-center bg-black/5">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/admin/suppliers')}
                        className="w-10 h-10 rounded-xl bg-black/5 border border-black/5 flex items-center justify-center text-black/40 hover:text-text-cream hover:bg-black/10 transition-all font-black"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="admin-page-title text-2xl md:text-3xl">{supplier?.businessName}</h1>
                        <p className="text-black/60 text-[10px] md:text-[11px] font-black uppercase tracking-widest mt-2">
                            Supplier ID: {supplier?.id?.slice(-8).toUpperCase() || "SUP-XXXXX"}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-black/20 text-[9px] font-black uppercase tracking-widest">Partner Since</p>
                        <p className="text-black/60 text-xs font-bold">{new Date(supplier.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="w-px h-8 bg-black/5"></div>
                    <div className="w-12 h-12 rounded-2xl bg-accent-lime/10 border border-accent-lime/20 flex items-center justify-center text-accent-lime">
                        <Building2 size={24} />
                    </div>
                </div>
            </div>

            <div className="flex-1 p-4 md:p-8 w-full">
                {/* Stats / Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="admin-card p-6 flex flex-col h-full">
                        <p className="text-[10px] font-black uppercase tracking-widest text-accent-lime mb-4 flex items-center gap-2"><User size={12} /> Contact Person</p>
                        <div className="flex-1 flex flex-col justify-center">
                            <h4 className="text-text-cream text-lg font-black mb-1 truncate">{[supplier.firstName, supplier.lastName].filter(Boolean).join(' ')}</h4>
                            <div className="flex flex-col gap-2 mt-2">
                                <a href={`mailto:${supplier.email}`} className="text-black/40 hover:text-accent-lime text-[11px] font-bold flex items-center gap-3 transition-colors underline decoration-black/5 underline-offset-4">
                                    <div className="w-7 h-7 rounded-lg bg-black/5 flex items-center justify-center shrink-0"><Mail size={12} /></div>
                                    {supplier.email}
                                </a>
                                <a href={`tel:${supplier.phone}`} className="text-black/40 hover:text-accent-lime text-[11px] font-bold flex items-center gap-3 transition-colors underline decoration-black/5 underline-offset-4">
                                    <div className="w-7 h-7 rounded-lg bg-black/5 flex items-center justify-center shrink-0"><Phone size={12} /></div>
                                    {supplier.phone}
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="admin-card p-6 flex flex-col h-full">
                        <p className="text-[10px] font-black uppercase tracking-widest text-accent-lime mb-4 flex items-center gap-2"><ShieldCheck size={12} /> Account Authorization</p>
                        <div className="flex-1 flex flex-col justify-center gap-4">
                            <div className="relative">
                                <select 
                                    value={supplier.supplierStatus}
                                    onChange={(e) => handleSupplierStatus(e.target.value)}
                                    className={`
                                        w-full text-[9px] font-black uppercase tracking-widest pl-3 pr-8 py-2.5 rounded-lg border appearance-none outline-none cursor-pointer transition-all text-left
                                        ${supplier.supplierStatus === 'ACTIVE' ? 'bg-accent-lime/10 text-accent-lime border-accent-lime/20' : 
                                          supplier.supplierStatus === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                          'bg-red-500/10 text-red-500 border-red-500/20'}
                                        hover:brightness-95
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
                            
                            <p className="text-black/20 text-[9px] font-black uppercase tracking-widest leading-relaxed">
                                {supplier.supplierStatus === 'ACTIVE' 
                                    ? 'Account has full access to inventory and order systems.' 
                                    : supplier.supplierStatus === 'PENDING'
                                    ? 'Access is limited until administrative verification.'
                                    : 'All partner privileges have been temporarily revoked.'
                                }
                            </p>
                        </div>
                    </div>

                    <div className="admin-card p-6 flex flex-col h-full bg-blue-500/5 border-blue-500/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-500/60 mb-4 flex items-center gap-2"><ShoppingBag size={12} /> Fulfillment volume</p>
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="flex items-end gap-3 mb-4">
                                <span className="text-4xl font-black text-blue-500 tabular-nums leading-none">{orders.length}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500/40 pb-1.5">Total Orders</span>
                            </div>
                            <div className="w-full bg-blue-500/10 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="bg-blue-500 h-full rounded-full transition-all duration-1000 shadow-lg shadow-blue-500/20" 
                                    style={{ width: `${Math.min(100, (orders.length / 50) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="admin-card p-6 flex flex-col h-full">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-4">Partner Activity</h4>
                        <div className="flex-1 flex flex-col justify-center space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-black/40 text-[10px] font-black uppercase tracking-widest">Active Requests</span>
                                <span className="text-black text-xs font-bold tabular-nums">{orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-green-600/50 text-[10px] font-black uppercase tracking-widest">Completed</span>
                                <span className="text-green-600 text-xs font-bold tabular-nums">{orders.filter(o => o.status === 'DELIVERED').length}</span>
                            </div>
                            <div className="w-full h-px bg-black/5"></div>
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-black/20 text-[9px] font-black uppercase tracking-widest">Performance Score</span>
                                <span className="text-blue-500 text-[10px] font-black">98.5%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders Section */}
                <div className="space-y-6">
                    <div className="admin-card border-l-4 border-l-blue-500">
                        <h3 className="text-xs font-black uppercase tracking-widest text-black/40 mb-6 flex items-center gap-2">
                            <ShoppingBag size={14} className="text-blue-500" /> assigned orders
                        </h3>
                        
                        {loadingOrders ? (
                            <LoadingSpinner message="Retrieving order ledger..." />
                        ) : orders.length === 0 ? (
                            <div className="py-20 text-center border border-dashed border-black/10 rounded-[40px] bg-black/2">
                                <AlertCircle className="mx-auto text-black/5 mb-6" size={64} />
                                <p className="text-black/30 text-[10px] font-black uppercase tracking-widest italic max-w-sm mx-auto leading-loose">
                                    No orders assigned to this partner.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th className="text-blue-500">Order #</th>
                                            <th className="text-blue-500">Customer</th>
                                            <th className="text-blue-500 text-center">Status Management</th>
                                            <th className="text-blue-500 text-right">Total</th>
                                            <th className="text-blue-500 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(o => (
                                            <tr key={o.id} className="group/row">
                                                <td className="px-8 py-6 cursor-pointer" onClick={() => navigate(`/admin/orders/${o.id}`)}>
                                                    <div className="flex flex-col">
                                                        <span className="text-[12px] font-black text-text-cream tabular-nums">{o.orderNumber}</span>
                                                        <span className="text-[9px] font-black text-black/20 uppercase tracking-tighter">
                                                            {new Date(o.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 cursor-pointer" onClick={() => navigate(`/admin/orders/${o.id}`)}>
                                                    <div className="flex flex-col">
                                                        <span className="text-[12px] font-black text-text-cream">
                                                            {o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : o.guestEmail || 'Unauthenticated'}
                                                        </span>
                                                        <span className="text-[9px] font-black text-black/20 uppercase tracking-widest">
                                                            {o.customer ? 'Member' : 'Guest'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center justify-center">
                                                        <select 
                                                            value={o.status || 'PENDING'}
                                                            onChange={(e) => handleOrderStatusUpdate(o.id, e.target.value)}
                                                            className={`
                                                                text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border appearance-none outline-none cursor-pointer transition-all text-center min-w-[120px]
                                                                ${o.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                                                  o.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                                                  o.status === 'PROCESSING' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                                  'bg-amber-500/10 text-amber-500 border-amber-500/20'}
                                                            `}
                                                        >
                                                            <option value="PENDING">Pending</option>
                                                            <option value="PROCESSING">Processing</option>
                                                            <option value="SHIPPED">Shipped</option>
                                                            <option value="DELIVERED">Delivered</option>
                                                            <option value="CANCELLED">Cancelled</option>
                                                        </select>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right cursor-pointer" onClick={() => navigate(`/admin/orders/${o.id}`)}>
                                                    <span className="text-[12px] font-black text-text-cream tabular-nums">£{Number(o.totalAmount).toFixed(2)}</span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeleteModal({ isOpen: true, id: o.id });
                                                        }}
                                                        className="w-8 h-8 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-500/40 hover:text-red-500 flex items-center justify-center transition-all mx-auto lg:ml-auto lg:mr-0 border border-transparent hover:border-red-500/20"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* No Modals required anymore as product logic is removed from here */}
            
            <DeleteConfirmModal 
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={handleDeleteOrder}
                isLoading={isDeleting}
                title="Purge Order Record"
                message="Are you sure you want to permanently remove this order from the ledger? This action cannot be revoked."
            />
        </div>
    );
};

export default AdminSupplierDetailsPage;

