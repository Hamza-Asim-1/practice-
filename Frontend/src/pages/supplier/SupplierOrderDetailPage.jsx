import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OrderInvoice from '../../components/shared/OrderInvoice';
import SupplierDashboardLayout from '../../components/supplier/SupplierDashboardLayout';
import { ArrowLeft, Printer, AlertTriangle, Play, CheckCircle, Loader2, Truck } from 'lucide-react';
import { ORDER_STATUS_CONFIG } from '../../config/orders';

const API_BASE = import.meta.env.VITE_API_BASE;

const SupplierOrderDetailPage = () => {
    const { id }  = useParams();
    const { user } = useAuth();
    const navigate  = useNavigate();
    const [order, setOrder]   = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = () => {
        fetch(`${API_BASE}/orders/${id}`, { credentials: 'include' })
            .then(r => r.json())
            .then(data => { setOrder(data); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { if (user) fetchOrder(); }, [id, user]);

    const updateStatus = async (status) => {
        setLoading(true); // Show loading while re-fetching
        try {
            await fetch(`${API_BASE}/orders/${id}/status`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            await fetchOrder();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const flagIssue = async () => {
        await fetch(`${API_BASE}/orders/${id}/issue`, { method: 'PATCH', credentials: 'include' });
        fetchOrder();
    };

    if (loading) return (
        <SupplierDashboardLayout title="Loading...">
             <div className="py-20 flex flex-col items-center justify-center text-black/20 text-center">
                <p className="text-sm font-black uppercase tracking-widest animate-pulse">Retrieving Manifest...</p>
            </div>
        </SupplierDashboardLayout>
    );

    if (!order) return (
        <SupplierDashboardLayout title="Not Found">
            <div className="py-20 text-center">
                <p>Order not found.</p>
                <Link to="/supplier/orders" className="text-accent-lime underline">Back to Orders</Link>
            </div>
        </SupplierDashboardLayout>
    );

    return (
        <SupplierDashboardLayout title={`Order #${order.orderNumber}`}>
            <div className="max-w-6xl">
                {/* Back Nav */}
                <button onClick={() => navigate('/supplier/orders')} className="flex items-center gap-2 text-black/40 hover:text-black transition-colors mb-8 group uppercase text-[10px] font-black tracking-widest">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Dispatch Registry
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Details & Items */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Status Card */}
                        <div className="bg-white border border-black/5 rounded-3xl p-8 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <div className="text-[10px] font-black text-black/20 uppercase tracking-[3px] mb-2">Current Lifecycle Phase</div>
                                    <div className="flex items-center gap-3">
                                        {(() => {
                                            const config = ORDER_STATUS_CONFIG[order.status] || { label: order.status, color: '#94a3b8' };
                                            return (
                                                <>
                                                    <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: config.color }} />
                                                    <h2 className="text-2xl font-black uppercase tracking-tighter" style={{ color: config.color }}>{config.label}</h2>
                                                </>
                                            );
                                        })()}
                                    </div>
                                    <p className="text-xs text-black/40 mt-1 uppercase font-bold tracking-wider">Transmission: {new Date(order.createdAt).toLocaleString('en-GB')}</p>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <select 
                                            className={`bg-black text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl shadow-xl outline-none cursor-pointer hover:bg-neutral-800 transition-all pr-12 appearance-none ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                                            value={order.status}
                                            onChange={(e) => updateStatus(e.target.value)}
                                            disabled={loading}
                                        >
                                            <option value="PENDING_PAYMENT">Awaiting Payment</option>
                                            <option value="CONFIRMED">Confirmed</option>
                                            <option value="IN_PREPARATION">In Preparation</option>
                                            <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                                            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                                            <option value="DELIVERED">Delivered</option>
                                            <option value="ISSUE_FLAGGED">Issue Flagged</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                            {loading ? <Loader2 size={12} className="animate-spin" /> : <Play size={10} className="rotate-90 fill-current" />}
                                        </div>
                                    </div>
                                    <button onClick={() => window.print()} className="w-12 h-12 flex items-center justify-center rounded-xl border border-black/10 hover:bg-black hover:text-white transition-all shadow-sm">
                                        <Printer size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="bg-white border border-black/5 rounded-3xl overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-black/5 bg-black/[0.02]">
                                <h3 className="text-xs font-black uppercase tracking-widest">Order Manifest</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-[10px] font-black text-black/30 uppercase tracking-widest border-b border-black/5">
                                            <th className="px-6 py-4">Item Catalog</th>
                                            <th className="px-6 py-4 text-center">Batch</th>
                                            <th className="px-6 py-4">Configuration</th>
                                            <th className="px-6 py-4 text-right">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/5">
                                        {order.items?.map(item => (
                                            <tr key={item.id} className="hover:bg-black/[0.01] transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="font-black uppercase text-sm">{item.product?.name || 'Unknown Specimen'}</div>
                                                    <div className="text-[10px] text-black/30 font-mono mt-0.5">ID: {item.id.slice(-8).toUpperCase()}</div>
                                                </td>
                                                <td className="px-6 py-5 text-center font-black">x{item.quantity}</td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {[item.weight, item.cutType, item.fatPreference, item.bonePreference].filter(Boolean).map(tag => (
                                                            <span key={tag} className="text-[9px] font-black uppercase tracking-widest bg-black/5 border border-black/5 px-2 py-0.5 rounded-sm text-black/60">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    {item.specialNotes && (
                                                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                                                            <div className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Butcher's Instructions</div>
                                                            <div className="text-xs font-bold text-red-600 uppercase leading-tight">{item.specialNotes}</div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-right font-black">£{Number(item.priceAtTime * item.quantity).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Summaries & Flags */}
                    <div className="space-y-8">
                        {/* Financials */}
                        <div className="bg-black text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-lime/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="text-[10px] font-black text-white/30 uppercase tracking-[3px] mb-6">Financial Settlement</div>
                            <div className="space-y-4">
                                <div className="flex justify-between text-xs text-white/60 font-bold uppercase tracking-wider">
                                    <span>Subtotal</span><span>£{Number(order.subtotal).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-white/60 font-bold uppercase tracking-wider pb-4 border-b border-white/10">
                                    <span>Logistics</span><span>£{Number(order.deliveryFee).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-end pt-2">
                                    <div>
                                        <div className="text-[8px] font-black text-accent-lime uppercase tracking-widest mb-1">Grand Total</div>
                                        <div className="text-4xl font-black tracking-tighter">£{Number(order.totalAmount).toFixed(2)}</div>
                                    </div>
                                    <div className="bg-accent-lime/10 border border-accent-lime/20 text-accent-lime text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-[1px] mb-1">Paid</div>
                                </div>
                            </div>
                        </div>

                        {/* Connection to Logistics */}
                        <div className="bg-white border border-black/5 rounded-3xl p-8 shadow-sm">
                            <div className="text-[10px] font-black text-black/20 uppercase tracking-[3px] mb-4">Logistics Directive</div>
                            <div className="p-4 bg-black/5 rounded-2xl border border-black/5">
                                <div className="text-[9px] font-black text-black/40 uppercase tracking-widest mb-2">Driver Instructions</div>
                                <p className="text-xs font-bold text-black uppercase leading-relaxed font-mono">
                                    {order.address?.deliveryInstructions || 'NO SPECIFIC INSTRUCTIONS PROVIDED'}
                                </p>
                            </div>
                        </div>

                        {/* Crisis Management */}
                        <div className="bg-white border border-red-500/10 rounded-3xl p-8 shadow-sm">
                            <div className="flex items-center gap-3 text-red-500 mb-4">
                                <AlertTriangle size={18} />
                                <h4 className="text-[10px] font-black uppercase tracking-[2px]">Crisis Management</h4>
                            </div>
                            <p className="text-[11px] text-black/40 mb-6 font-bold uppercase leading-relaxed">If there is an issue with the inventory or fulfillment of this order, flag it for immediate review.</p>
                            <button onClick={flagIssue} className="w-full py-3 bg-red-50 rounded-xl text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                                Flag Production Issue
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <OrderInvoice order={order} />
        </SupplierDashboardLayout>
    );
};

export default SupplierOrderDetailPage;
