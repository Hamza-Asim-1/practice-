import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import SupplierDashboardLayout from '../../components/supplier/SupplierDashboardLayout';
import { ORDER_STATUS_CONFIG } from '../../config/orders';

const API_BASE = import.meta.env.VITE_API_BASE;

const SupplierOrdersPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter]   = useState('ALL');

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetch(`${API_BASE}/orders/supplier`, { credentials: 'include' })
            .then(r => r.json())
            .then(data => { 
                setOrders(Array.isArray(data) ? data : []); 
                setLoading(false); 
            })
            .catch(() => setLoading(false));
    }, [user, navigate]);

    const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

    return (
        <SupplierDashboardLayout title="Incoming Orders">
            {/* Header / Filters */}
            <div className="flex justify-between items-center flex-wrap gap-5 mb-10">
                <div className="flex gap-3 flex-wrap">
                    {['ALL', 'CONFIRMED', 'IN_PREPARATION', 'READY_FOR_PICKUP'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-sm
                                ${filter === s
                                    ? 'bg-black text-white border border-black'
                                    : 'bg-white border border-black/10 text-black/40 hover:text-black hover:border-black/20'}`}>
                            {s.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders list */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-black/20">
                    <p className="text-sm font-black uppercase tracking-widest animate-pulse">Scanning Registry...</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {filtered.length === 0 ? (
                        <div className="py-20 text-center border border-dashed border-black/10 rounded-2xl bg-white">
                            <p className="text-black/30 font-bold uppercase tracking-widest text-xs">No orders found in this category</p>
                        </div>
                    ) : (
                        filtered.map(order => (
                            <Link
                                to={`/supplier/orders/${order.id}`}
                                key={order.id}
                                className="flex justify-between items-center bg-white border border-black/5 px-8 py-6 rounded-2xl transition-all duration-300 no-underline text-black hover:border-black/20 hover:shadow-xl hover:-translate-y-1 group">
                                <div>
                                    <div className="text-[10px] font-black text-black/20 uppercase tracking-[3px] mb-1">Transmission #{order.orderNumber}</div>
                                    <div className="text-lg font-black tracking-tighter uppercase">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                    <div className="text-[11px] text-black/40 font-mono mt-1">{new Date(order.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                                <div className="flex gap-8 items-center">
                                    <div className="text-right">
                                        {(() => {
                                            const config = ORDER_STATUS_CONFIG[order.status] || { label: order.status, color: '#94a3b8' };
                                            return (
                                                <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-1 inline-block border"
                                                     style={{ color: config.color, borderColor: `${config.color}30`, backgroundColor: `${config.color}10` }}>
                                                    {order.complexityFlag ? '⚠ COMPLEX' : config.label}
                                                </div>
                                            );
                                        })()}
                                        <div className="font-black text-xl tracking-tighter">
                                            £{Number(order.totalAmount).toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/20 group-hover:bg-black group-hover:text-white transition-all">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </SupplierDashboardLayout>
    );
};

export default SupplierOrdersPage;
