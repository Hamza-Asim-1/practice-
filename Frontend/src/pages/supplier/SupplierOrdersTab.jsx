import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
    Package, Clock, Truck, CheckCircle2, AlertCircle, 
    XCircle, ArrowUpRight, Loader2, ChevronDown
} from 'lucide-react';
import { ORDER_STATUS_CONFIG } from '../../config/orders';

const API_BASE = import.meta.env.VITE_API_BASE;

export default function SupplierOrdersTab() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    // Fetch supplier orders
    useEffect(() => {
        if (!user) return;
        setLoading(true);
        fetch(`${API_BASE}/orders/supplier`, {
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            setOrders(Array.isArray(data) ? data : []);
            setLoading(false);
        })
        .catch(err => {
            console.error('Failed to fetch supplier orders:', err);
            setLoading(false);
        });
    }, [user]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error('Status update failed');
            
            // Optimistic update
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (err) {
            console.error(err);
            alert('Failed to update order status');
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center text-[#888]">
                <Loader2 size={32} className="animate-spin mb-4" />
                <p className="text-sm font-bold tracking-widest uppercase">Loading Orders...</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-white/2">
                <Package size={48} className="mx-auto text-white/20 mb-4" />
                <h3 className="text-xl font-bold mb-2">No Orders Yet</h3>
                <p className="text-[#888] text-sm">You'll see orders here as customers purchase your products.</p>
            </div>
        );
    }

    // Sort: most recent first
    const sortedOrders = [...orders].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <div className="space-y-4">
            {sortedOrders.map(order => {
                const config = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG['CONFIRMED'];
                
                return (
                    <div key={order.id} className="bg-[#0f0f11] border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:border-white/10 transition-colors">
                        
                        {/* Order Details */}
                        <div className="flex-1">
                            <Link to={`/supplier/orders/${order.id}`} className="group/link block">
                                <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-extrabold text-xl tracking-tight text-white mb-0 leading-none group-hover/link:text-accent-lime transition-colors">#{order.orderNumber}</h4>
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                                        style={{ color: config.color, borderColor: `${config.color}30`, backgroundColor: `${config.color}10` }}>
                                        {config.label}
                                    </span>
                                    <ArrowUpRight size={14} className="text-white/20 group-hover/link:text-accent-lime group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all" />
                                </div>
                            </Link>
                            
                            <div className="text-sm text-[#888] font-medium flex items-center gap-4 mb-4">
                                <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                <span>{order.items?.length || 0} items</span>
                            </div>

                            {/* Summary showing only supplied products */}
                            <div className="text-xs text-[#AAA] max-w-md">
                                {order.items?.map(item => (
                                    <div key={item.id} className="flex justify-between items-center mb-1">
                                        <span>{item.quantity}x {item.product?.name || 'Unknown Product'}</span>
                                        <span>£{((item.priceAtTime || 0) * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions Matrix */}
                        <div className="flex flex-col gap-3 w-full md:w-[220px] shrink-0">
                            
                            {/* Status Dropdown */}
                            <div className="relative group/dropdown">
                                <button disabled={updatingId === order.id} className="w-full flex items-center justify-between px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm font-bold text-white transition-colors hover:border-accent-lime">
                                    {updatingId === order.id ? <Loader2 size={16} className="animate-spin" /> : 'Update Status'}
                                    <ChevronDown size={16} className="text-[#888]" />
                                </button>
                                
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#111] border border-white/10 rounded-xl shadow-xl overflow-hidden opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all z-20 translate-y-2 group-hover/dropdown:translate-y-0">
                                    {['CONFIRMED', 'IN_PREPARATION', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'ISSUE_FLAGGED'].map(status => (
                                        <button 
                                            key={status}
                                            onClick={() => handleUpdateStatus(order.id, status)}
                                            className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${order.status === status ? 'bg-accent-lime/10 text-accent-lime' : 'text-[#888] hover:text-white hover:bg-white/5'}`}
                                        >
                                            {status.replace(/_/g, ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
