import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CustomerDashboardLayout from '../components/account/CustomerDashboardLayout';
import { OrderTrackingSkeleton } from '../components/account/DashboardSkeleton';
import { ORDER_STATUS_CONFIG } from '../config/orders';

const API_BASE = import.meta.env.VITE_API_BASE;
const STATUSES = ['CONFIRMED', 'IN_PREPARATION', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const OrderTrackingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOpts = user ? { credentials: 'include' } : {};
        fetch(`${API_BASE}/orders/${id}`, fetchOpts)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch order');
                return res.json();
            })
            .then(data => { setOrder(data); setLoading(false); })
            .catch(err => { 
                console.error(err);
                setLoading(false); 
            });
    }, [id, user]);

    if (loading) return (
        <CustomerDashboardLayout title="Tracking Selection">
            <OrderTrackingSkeleton />
        </CustomerDashboardLayout>
    );
    
    if (!order || order.statusCode) return (
        <CustomerDashboardLayout title="Order Not Found">
            <div className="max-w-[600px] text-center bg-white p-10 rounded-3xl border border-black/5 shadow-2xl transition-all">
                <h2 className="text-3xl font-extrabold mb-4 italic tracking-tighter text-text-cream">Order Not Found</h2>
                <p className="text-black/40 mb-10">We couldn't find an order with this ID. Please make sure you are logged in with the correct account.</p>
                <button className="lime-btn px-10" onClick={() => navigate('/products')}>Browse Products</button>
            </div>
        </CustomerDashboardLayout>
    );

    const currentIdx = STATUSES.indexOf(order.status);
    const createdAt = order.createdAt ? new Date(order.createdAt) : null;

    return (
        <CustomerDashboardLayout title={`Order #${order.orderNumber || 'N/A'}`}>
            <p className="text-black/40 text-sm md:text-base mb-8 md:mb-[60px] font-semibold -mt-4 md:-mt-8">
                {createdAt ? `Placed on ${createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}` : 'Date unavailable'}
            </p>

                {/* Status Stepper */}
                <div className="relative max-w-[800px] mb-8 md:mb-[60px] flex justify-between gap-1 overflow-x-auto pb-4 sm:pb-0 scrollbar-hide">
                    <div className="absolute top-6 left-10 right-10 h-[3px] bg-black/5 rounded-full z-0 hidden sm:block"></div>
                    {STATUSES.map((statusKey, idx) => {
                        const config = ORDER_STATUS_CONFIG[statusKey] || { label: statusKey, color: '#94a3b8' };
                        const isDone = idx < currentIdx;
                        const isActive = idx === currentIdx;
                        const isFuture = idx > currentIdx;

                        return (
                            <div key={statusKey} className="flex flex-col items-center z-10 flex-1 min-w-[70px]">
                                <div 
                                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center font-extrabold text-xs md:text-sm mb-3 transition-all duration-500 shadow-lg ${
                                        isFuture ? 'bg-[#f8f9fa] border-black/5 text-black/20' : 'bg-white text-black'
                                    }`}
                                    style={!isFuture ? { 
                                        borderColor: config.color,
                                        backgroundColor: isDone ? config.color : 'white',
                                        color: isDone ? 'white' : 'black',
                                        boxShadow: isActive ? `0 0 20px ${config.color}40` : 'none'
                                    } : {}}
                                >
                                    {isDone ? '✓' : idx + 1}
                                </div>
                                <span 
                                    className={`text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-center transition-colors duration-500 ${isFuture ? 'text-black/20' : 'text-text-cream'}`}
                                    style={isActive ? { color: config.color } : {}}
                                >
                                    {config.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {order.trackingUrl && (
                    <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="grow h-[72px]! inline-flex items-center justify-center mb-10 md:mb-[60px] px-8 py-4 bg-text-cream text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.4em] transition-all hover:bg-accent-lime hover:text-black hover:shadow-[0_20px_40px_rgba(186,205,56,0.3)] hover:-translate-y-1 active:scale-95 no-underline">
                        Track Live Delivery →
                    </a>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
                    {/* Items List */}
                    <div className="lg:col-span-2 bg-white border border-black/5 p-6 md:p-8 rounded-3xl shadow-xl">
                        <h3 className="text-lg md:text-xl font-bold mb-6 pb-4 border-b border-black/5 text-text-cream">Order Items</h3>
                        <div className="divide-y divide-black/5">
                            {order.items?.map(item => (
                                <div key={item.id} className="py-6 first:pt-0 last:pb-0 group">
                                    <div className="flex gap-4 md:gap-6 items-center">
                                        {item.product?.imageUrl && (
                                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-black/5 border border-black/5 shrink-0">
                                                <img src={item.product.imageUrl || '/placeholder.png'} alt={item.product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            </div>
                                        )}
                                        <div className="grow min-w-0">
                                            <div className="flex justify-between items-start mb-1 flex-wrap gap-2">
                                                <strong className="text-base md:text-lg font-bold text-text-cream group-hover:text-accent-lime transition-colors truncate">{item.product?.name || 'Product'}</strong>
                                                <span className="text-accent-lime font-bold">£{Number(item.priceAtTime || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="text-[10px] md:text-sm text-black/40 font-bold uppercase tracking-wider truncate">
                                                <span>qty: {item.quantity}</span>
                                                <span className="mx-2 opacity-30">|</span>
                                                <span>{[item.weight, item.cutType, item.fatPreference].filter(Boolean).join(' · ')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-white border border-black/5 p-6 md:p-8 rounded-3xl shadow-xl h-fit">
                        <h3 className="text-lg md:text-xl font-bold mb-6 pb-4 border-b border-black/5 text-text-cream">Final Summary</h3>
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-black/50 font-semibold text-sm"><span>Subtotal</span><span>£{Number(order.subtotal || 0).toFixed(2)}</span></div>
                            <div className="flex justify-between text-black/50 font-semibold text-sm"><span>Delivery</span><span>£{Number(order.deliveryFee || 0).toFixed(2)}</span></div>
                        </div>
                        <div className="pt-6 border-t border-black/10 flex flex-col gap-4">
                            {order.stripeStatus === 'succeeded' && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-accent-lime/10 rounded-xl border border-accent-lime/20">
                                    <div className="w-2 h-2 rounded-full bg-accent-lime animate-pulse"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-text-cream">Payment Verified by Stripe</span>
                                </div>
                            )}
                            <div className="flex justify-between items-end">
                                <span className="text-xs md:text-sm font-bold text-black/20 uppercase tracking-[2px]">{order.stripeStatus === 'succeeded' ? 'Total Paid' : 'Total Amount'}</span>
                                <span className="text-2xl md:text-3xl font-black italic text-text-cream">£{Number(order.totalAmount || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
        </CustomerDashboardLayout>
    );
};

export default OrderTrackingPage;
