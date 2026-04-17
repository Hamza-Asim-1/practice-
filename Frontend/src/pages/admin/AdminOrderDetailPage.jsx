import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    ChevronLeft, 
    ShoppingBag, 
    User, 
    MapPin, 
    FileText, 
    Clock, 
    Package,
    ArrowUpRight,
    CreditCard,
    Beef,
    Loader2,
    Truck,
    CheckCircle2,
    RefreshCw
} from 'lucide-react';
import OrderInvoice from '../../components/shared/OrderInvoice';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const API_BASE = import.meta.env.VITE_API_BASE;

import { ORDER_STATUS_CONFIG } from '../../config/orders';

const AdminOrderDetailPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [allSuppliers, setAllSuppliers] = useState([]);
    const [isAssigning, setIsAssigning] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const handleSyncPayment = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch(`${API_BASE}/orders/${id}/sync-payment`, {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok) {
                fetchOrder();
            }
        } catch (error) {
            console.error('Sync failed', error);
        } finally {
            setIsSyncing(false);
        }
    };

    const fetchOrder = () => {
        if (!user || !id) return;
        fetch(`${API_BASE}/orders/${id}`, {
            credentials: 'include'
        })
            .then(r => r.json())
            .then(d => setOrder(d))
            .catch(() => { });
    };

    useEffect(() => {
        fetchOrder();
        if (id) {
            fetch(`${API_BASE}/orders/${id}/suggestions`, { credentials: 'include' })
                .then(r => r.json())
                .then(d => setSuggestions(Array.isArray(d) ? d : []))
                .catch(() => { });

            fetch(`${API_BASE}/suppliers`, { credentials: 'include' })
                .then(r => r.json())
                .then(d => setAllSuppliers(Array.isArray(d) ? d : []))
                .catch(() => { });
        }
    }, [id, user]);

    const handleStatusUpdate = async (status) => {
        setIsUpdatingStatus(true);
        try {
            await fetch(`${API_BASE}/orders/${id}/status`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            setOrder(prev => ({ ...prev, status }));
        } catch (error) {
            console.error('Status update failed', error);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleAssignSupplier = async (supplierId) => {
        setIsAssigning(true);
        try {
            const res = await fetch(`${API_BASE}/orders/${id}/assign-supplier`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ supplierId })
            });
            if (res.ok) {
                const updated = await res.json();
                setOrder(prev => ({ ...prev, supplier: updated.supplier, supplierId }));
            }
        } catch (error) {
            console.error('Assignment failed', error);
        } finally {
            setIsAssigning(false);
        }
    };

    if (!order) return <LoadingSpinner fullPage message="Loading order details..." />;

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-8">
                <button 
                    onClick={() => navigate('/admin/orders')}
                    className="flex items-center gap-2 text-black/40 hover:text-accent-lime transition-colors group mb-6"
                >
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Back to Orders</span>
                </button>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="admin-page-title text-2xl md:text-3xl">Order Details</h1>
                        <p className="text-black/60 text-[10px] md:text-[11px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                            ID: <span className="text-accent-lime underline decoration-accent-lime/30 underline-offset-4">{order?.id?.slice(-8).toUpperCase() || "ORD-XXXXX"}</span>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            className="bg-black/5 border border-black/10 hover:border-black/20 text-black/60 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all"
                            onClick={() => window.print()} 
                        >
                            Print Invoice
                        </button>
                        <div className="relative">
                            <select 
                                className={`bg-accent-lime text-black text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl shadow-lime outline-none cursor-pointer hover:bg-accent-hover transition-all pr-12 ${isUpdatingStatus ? 'opacity-50 pointer-events-none' : ''}`}
                                value={order.status}
                                onChange={(e) => handleStatusUpdate(e.target.value)} 
                                disabled={isUpdatingStatus}
                            >
                                <option value="PENDING_PAYMENT">AWAITING PAYMENT</option>
                                <option value="CONFIRMED">PAID & CONFIRMED</option>
                                <option value="IN_PREPARATION">IN PREPARATION</option>
                                <option value="READY_FOR_PICKUP">READY FOR PICKUP</option>
                                <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                                <option value="DELIVERED">DELIVERED</option>
                                <option value="ISSUE_FLAGGED">ISSUE FLAGGED</option>
                                <option value="CANCELLED">CANCELLED</option>
                                <option value="REFUNDED">REFUNDED</option>
                            </select>
                            {isUpdatingStatus && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <Loader2 size={12} className="animate-spin text-black" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                {/* Status Overview Card */}
                <div className="admin-card border-l-4 border-l-accent-lime p-5">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-accent-lime/10 flex items-center justify-center text-accent-lime">
                                <Package size={16} />
                            </div>
                            <div>
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-black/40">Current State</h4>
                                {(() => {
                                    const config = ORDER_STATUS_CONFIG[order.status] || { label: order.status, color: '#94a3b8' };
                                    return (
                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border"
                                              style={{ color: config.color, borderColor: `${config.color}30`, backgroundColor: `${config.color}10` }}>
                                            {config.label}
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pt-4 border-t border-black/5">
                            <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center text-black/30">
                                <CreditCard size={16} />
                            </div>
                            <div>
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-black/40">Financial State</h4>
                                <span className={`text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded-sm ${
                                    order.payment?.status === 'SUCCEEDED' ? 'bg-green-500/10 text-green-500' : 
                                    order.payment?.status === 'FAILED' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                                }`}>
                                    {order.payment?.status || 'NOT DETECTED'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stripe Live Status Card */}
                <div className="admin-card border-l-4 border-l-indigo-500 p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                <CheckCircle2 size={16} />
                            </div>
                            <div>
                                <h4 className="text-[9px] uppercase tracking-widest text-black/60 font-black underline decoration-indigo-500/30 underline-offset-4">Stripe Live</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded-sm ${
                                        order.stripeStatus === 'succeeded' ? 'bg-indigo-500 text-white shadow-sm' : 
                                        order.stripeStatus === 'processing' ? 'bg-amber-500 text-white' : 'bg-black/20 text-black/40'
                                    }`}>
                                        {order.stripeStatus || 'UNSYNCED'}
                                    </span>
                                    <button 
                                        onClick={handleSyncPayment}
                                        disabled={isSyncing}
                                        className={`p-1 rounded-lg hover:bg-black/5 transition-all ${isSyncing ? 'animate-spin text-indigo-500' : 'text-black/20 hover:text-indigo-500'}`}
                                    >
                                        <RefreshCw size={10} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {order.stripeAmountReceived > 0 && (
                        <div className="text-[9px] font-bold text-black/40 uppercase tracking-widest flex justify-between items-center pt-2 border-t border-black/5">
                            <span>Captured:</span>
                            <span className="text-indigo-500 font-black italic">£{(order.stripeAmountReceived / 100).toFixed(2)}</span>
                        </div>
                    )}
                </div>

                {/* Customer Snapshot */}
                <div className="admin-card p-5">
                    <div className="flex items-center gap-3 mb-4 text-black/30">
                        <User size={16} />
                        <h4 className="text-[9px] uppercase tracking-widest m-0 font-black">Customer</h4>
                    </div>
                    <div>
                        <p className="text-sm font-black tracking-tight text-text-cream truncate">
                            {order.customer ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}` : 'Guest Identity'}
                        </p>
                        <p className="text-[10px] font-medium text-black/40 truncate">{order.guestEmail || order.customer?.user?.email || 'N/A'}</p>
                    </div>
                </div>

                {/* Map/Destination Tighter */}
                <div className="admin-card p-5 group cursor-pointer hover:border-accent-lime/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3 text-black/30">
                            <MapPin size={16} />
                            <h4 className="text-[9px] uppercase tracking-widest m-0 font-black">Destination</h4>
                        </div>
                        <ArrowUpRight size={12} className="text-black/10 group-hover:text-accent-lime transition-colors" />
                    </div>
                    <div className="p-3 bg-black/5 border border-black/5 rounded-xl">
                        <p className="text-[10px] font-bold text-black/80 leading-tight m-0 italic line-clamp-2">
                            {order.address?.line1}, {order.address?.postcodeCode}
                        </p>
                    </div>
                </div>
            </div>

            {/* Supplier Assignment Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-1">
                    <div className="admin-card h-full border-l-4 border-l-blue-500 p-5">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <Truck size={18} />
                            </div>
                            <div>
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-black/40">Assigned Merchant</h4>
                                <span className="text-xs font-black text-text-cream italic uppercase">{order.supplier?.name || 'Unassigned'}</span>
                            </div>
                        </div>
                        <div className="p-3 bg-black/5 rounded-xl border border-black/5">
                            <p className="text-[8px] font-black text-black/40 uppercase tracking-widest mb-1">Base of Operations</p>
                            <p className="text-[10px] font-medium text-black/70 leading-relaxed italic line-clamp-3">
                                {[
                                    order.supplier?.addressLine1, 
                                    order.supplier?.city, 
                                    order.supplier?.postcode
                                ].filter(Boolean).join(', ') || 'Select merchant to update'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="admin-card h-full p-5">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-black/60 mb-1">Fulfillment Assignment</h4>
                                <p className="text-black/30 text-[9px] font-bold uppercase tracking-widest">Update order source merchant</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="bg-accent-lime/20 text-accent-lime text-[7px] font-black px-1.5 py-0.5 rounded leading-none uppercase">LOC: Local</span>
                                <span className="bg-blue-500/20 text-blue-500 text-[7px] font-black px-1.5 py-0.5 rounded leading-none uppercase">REG: Regional</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <select 
                                    className={`w-full bg-[#f8f9fa] border border-black/5 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-accent-lime transition-all appearance-none cursor-pointer pr-10 ${isAssigning ? 'opacity-50' : ''}`}
                                    value={order.supplierId || ''}
                                    onChange={(e) => handleAssignSupplier(e.target.value)}
                                    disabled={isAssigning}
                                >
                                    <option value="">-- UNASSIGNED --</option>
                                    {allSuppliers.sort((a, b) => {
                                        const scoreA = suggestions.find(s => s.id === a.id)?.score || 0;
                                        const scoreB = suggestions.find(s => s.id === b.id)?.score || 0;
                                        return scoreB - scoreA;
                                    }).map(s => {
                                        const suggestion = suggestions.find(sug => sug.id === s.id);
                                        const prefix = suggestion?.score === 100 ? '[LOC] ' : suggestion?.score === 50 ? '[REG] ' : '';
                                        return (
                                            <option key={s.id} value={s.id}>
                                                {prefix}{s.name} ({s.city || s.area || 'Unknown'})
                                            </option>
                                        );
                                    })}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black/20">
                                    <ChevronLeft size={12} className="-rotate-90" />
                                </div>
                            </div>
                            {isAssigning && (
                                <div className="flex items-center gap-2 text-accent-lime animate-pulse px-2">
                                    <Loader2 size={14} className="animate-spin" />
                                </div>
                            )}
                        </div>

                        {suggestions.length > 0 && (
                            <div className="mt-6 pt-5 border-t border-black/5">
                                <h5 className="text-[8px] font-black text-black/20 uppercase tracking-[0.2em] mb-3">Priority Matches</h5>
                                <div className="flex gap-2">
                                    {suggestions.slice(0, 3).map(s => (
                                        <button 
                                            key={s.id}
                                            onClick={() => handleAssignSupplier(s.id)}
                                            disabled={isAssigning}
                                            className={`px-4 py-2 rounded-lg border text-[9px] font-black transition-all whitespace-nowrap ${
                                                s.id === order.supplierId 
                                                ? 'bg-accent-lime text-black border-accent-lime' 
                                                : 'bg-black/5 border-black/5 hover:border-black/20 text-black/40'
                                            }`}
                                        >
                                            {s.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="admin-card">
                <div className="flex items-center gap-4 mb-10 text-black/20">
                    <ShoppingBag size={18} />
                    <h4 className="text-[10px] text-black/60 uppercase tracking-widest m-0">Manifest Inventory</h4>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Item Specification</th>
                                <th className="text-center">Volume</th>
                                <th className="text-right">Unit Rate</th>
                                <th className="text-right">Cumulative</th>
                            </tr>
                        </thead>
                        <tbody>{order.items?.map((item, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div className="flex items-center gap-4 py-1">
                                             <div className="w-12 h-12 rounded-xl bg-black/5 border border-black/5 flex items-center justify-center p-1 overflow-hidden">
                                                {item.product?.image ? (
                                                    <img src={item.product?.image} alt="" className="w-full h-full object-cover rounded-lg" />
                                                ) : (
                                                    <Beef size={20} className="text-black/10" />
                                                )}
                                            </div>
                                            <div>
                                                <span className="text-[13px] font-black text-text-cream">{item.product?.name}</span>
                                                <p className="text-[11px] text-black/30 uppercase tracking-widest font-black mt-1">SKU: {item.product?.id?.slice(0, 6)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className="text-[12px] font-black px-3 py-1 bg-black/5 rounded-lg border border-black/5 text-black/80">x {item.quantity}</span>
                                    </td>
                                    <td className="text-right font-bold text-black/40">£{Number(item.priceAtTime).toFixed(2)}</td> {/* Changed to item.priceAtTime */}
                                    <td className="text-right font-black text-text-cream">£{(Number(item.priceAtTime) * item.quantity).toFixed(2)}</td> {/* Changed to item.priceAtTime */}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="3" className="pt-10 pb-2 text-right text-[10px] font-black uppercase tracking-widest text-black/30 italic">Manifest Sub-Total</td>
                                <td className="pt-10 pb-2 text-right font-bold text-black italic">
                                    £{(Number(order.totalAmount || 0) - Number(order.deliveryFee || 0)).toFixed(2)}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="3" className="py-2 text-right text-[10px] font-black uppercase tracking-widest text-black/30 italic">Logistics Fee</td>
                                <td className="py-2 text-right font-bold text-black italic">£{Number(order.deliveryFee || 0).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colSpan="3" className="pt-4 text-right text-xs font-black uppercase tracking-widest text-accent-lime">Final Settlement</td>
                                <td className="pt-4 text-right text-2xl font-black text-accent-lime tracking-tighter">
                                    £{Number(order.totalAmount || 0).toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            <OrderInvoice order={order} />
            </div>
        </div>
    );
};

export default AdminOrderDetailPage;
