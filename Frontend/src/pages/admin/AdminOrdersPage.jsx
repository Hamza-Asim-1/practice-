import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Search, Filter, ChevronRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { ORDER_STATUS_CONFIG } from '../../config/orders';

import LoadingSpinner from '../../components/shared/LoadingSpinner';

const API_BASE = import.meta.env.VITE_API_BASE;

const AdminOrdersPage = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        fetch(`${API_BASE}/orders`, {
            credentials: 'include'
        })
            .then(r => r.json())
            .then(d => {
                setOrders(Array.isArray(d) ? d : []);
                setLoading(false);
            })
            .catch(() => { setLoading(false); });
    }, [user]);

    const filteredOrders = orders.filter(order => {
        const searchLower = searchTerm.toLowerCase();
        const orderIdMatch = (order.id || '').toLowerCase().includes(searchLower);
        const nameMatch = (order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : '').toLowerCase().includes(searchLower);
        const emailMatch = (order.guestEmail || (order.customer ? order.customer.email : '') || '').toLowerCase().includes(searchLower);
        
        return orderIdMatch || nameMatch || emailMatch;
    });

    return (
        <div className="animate-in fade-in duration-500">
            <div className="admin-page-header flex-col md:flex-row gap-6 md:items-end mb-8">
                <div className="flex-1 min-w-0">
                    <h1 className="admin-page-title text-2xl md:text-3xl">Orders</h1>
                    <p className="text-black/60 text-[10px] md:text-[11px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                        <ShoppingBag size={12} /> Manage and track all customer orders
                    </p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-initial">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search orders..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-black/5 border border-black/10 rounded-xl pl-12 pr-4 py-3 text-xs font-bold text-text-cream focus:border-accent-lime outline-none w-full md:w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="admin-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4 md:gap-6 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                        <button className="text-accent-lime text-[10px] md:text-[11px] font-black uppercase tracking-widest border-b-2 border-accent-lime pb-2 whitespace-nowrap">All Registers</button>
                        <button className="text-black/30 text-[10px] md:text-[11px] font-black uppercase tracking-widest pb-2 hover:text-text-cream transition-colors whitespace-nowrap">Pending</button>
                        <button className="text-black/30 text-[10px] md:text-[11px] font-black uppercase tracking-widest pb-2 hover:text-text-cream transition-colors whitespace-nowrap">Dispatched</button>
                    </div>
                    <button className="flex items-center gap-2 text-black/40 text-[10px] font-bold uppercase tracking-widest hover:text-text-cream transition-colors">
                        <Filter size={14} />
                        Advanced
                    </button>
                </div>

                <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th className="hidden lg:table-cell">Customer</th>
                                <th>Total Price</th>
                                <th className="hidden sm:table-cell">Status</th>
                                <th className="hidden md:table-cell">Time</th>
                                <th className="text-right">View</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6">
                                        <LoadingSpinner message="Loading orders..." />
                                    </td>
                                </tr>
                            ) : filteredOrders.length > 0 ? (
                                filteredOrders.map(order => (
                                    <tr key={order.id} className="group/row">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <ShoppingBag size={14} className="text-black/20 group-hover/row:text-accent-lime transition-colors" />
                                                <span className="font-black tracking-tight text-text-cream uppercase text-[11px] md:text-xs">{order.id?.slice(0, 8) || 'SIGNAL-ERR'}</span>
                                            </div>
                                        </td>
                                        <td className="hidden lg:table-cell">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-bold text-text-cream">
                                                    {order.customer ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() : (order.guestEmail || 'Anonymous Guest')}
                                                </span>
                                                <span className="text-[11px] text-black/30 italic">{order.guestEmail || 'Registered customer'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-[12px] md:text-[13px] font-black text-text-cream">£{Number(order.totalAmount || 0).toFixed(2)}</span>
                                        </td>
                                        <td className="hidden sm:table-cell">
                                            {(() => {
                                                const config = ORDER_STATUS_CONFIG[order.status] || { label: order.status || 'PENDING', color: '#94a3b8' };
                                                return (
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                                                          style={{ color: config.color, borderColor: `${config.color}30`, backgroundColor: `${config.color}10` }}>
                                                        {config.label}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="hidden md:table-cell">
                                            <div className="text-[11px] font-bold text-black/30 uppercase tracking-tighter flex items-center gap-2">
                                                <Clock size={12} /> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <Link to={`/admin/orders/${order.id}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/5 border border-black/5 text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-text-cream hover:bg-black/10 hover:border-black/20 transition-all">
                                                <span className="hidden sm:inline">Details</span> <ChevronRight size={12} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-20 text-black/20 italic font-medium">No order signals detected in system cache.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminOrdersPage;
