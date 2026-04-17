import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Package, TrendingUp, AlertCircle, ArrowUpRight, DollarSign } from 'lucide-react';
import SupplierDashboardLayout from '../../components/supplier/SupplierDashboardLayout';

const SupplierOverviewPage = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        totalSales: 0,
        salesChartData: [],
        categoryDist: []
    });
    const [loading, setLoading] = useState(true);

    const API_BASE = import.meta.env.VITE_API_BASE;

    useEffect(() => {
        fetch(`${API_BASE}/orders/supplier`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                const ordersList = Array.isArray(data) ? data : [];
                setOrders(ordersList);

                // Calculations
                const totalSales = ordersList.reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);
                const pendingOrders = ordersList.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status)).length;

                // Chart Data (Last 7 Days)
                const last7Days = [...Array(7)].map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - i));
                    const dateStr = date.toISOString().split('T')[0];
                    const dayTotal = ordersList
                        .filter(o => o.createdAt?.startsWith(dateStr))
                        .reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);
                    return { date: dateStr, total: dayTotal };
                });

                // Category Distribution
                const catMap = {};
                ordersList.forEach(order => {
                    order.items?.forEach(item => {
                        const catName = item.product?.categoryObj?.name || item.product?.category || 'Uncategorized';
                        catMap[catName] = (catMap[catName] || 0) + 1;
                    });
                });
                const totalItems = Object.values(catMap).reduce((a, b) => a + b, 0);
                const categoryDist = Object.entries(catMap)
                    .map(([name, count]) => ({
                        name,
                        percentage: totalItems > 0 ? Math.round((count / totalItems) * 100) : 0
                    }))
                    .sort((a, b) => b.percentage - a.percentage)
                    .slice(0, 3);

                setStats({
                    totalOrders: ordersList.length,
                    pendingOrders,
                    totalSales,
                    salesChartData: last7Days,
                    categoryDist
                });
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch BI data', err);
                setLoading(false);
            });
    }, []);

    const statCards = [
        { label: 'Total Revenue', value: `£${stats.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-accent-lime', trend: 'LIVE' },
        { label: 'Assigned Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-500', trend: 'ACTIVE' },
        { label: 'In Progress', value: stats.pendingOrders, icon: AlertCircle, color: 'text-orange-500', trend: 'PENDING' },
    ];

    return (
        <SupplierDashboardLayout title="Business Intelligence">
            {/* ── Stats Overview ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {statCards.map((card, i) => (
                    <div key={i} className="bg-white p-7 rounded-[32px] border border-black/5 shadow-xl shadow-black/5 hover:shadow-accent-lime/5 hover:border-accent-lime/20 transition-all duration-500 group">
                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center group-hover:bg-accent-lime/10 transition-colors`}>
                                <card.icon size={22} className={`${card.color} group-hover:scale-110 transition-transform`} />
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-full">
                                <ArrowUpRight size={10} /> {card.trend}
                            </div>
                        </div>
                        <div className="text-3xl font-black tracking-tighter mb-1 italic">
                            {loading ? <div className="h-8 w-24 bg-black/5 animate-pulse rounded-lg" /> : card.value}
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[2px] text-black/30">{card.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* ── Sales Trend Chart ─────────────────────────────────── */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-black/5 shadow-xl shadow-black/5">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black tracking-tight uppercase italic">Revenue Growth</h2>
                            <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mt-1">Monthly performance overview</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-lime/10 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent-lime shadow-[0_0_8px_rgba(186,205,56,1)]" />
                                <span className="text-[9px] font-black uppercase tracking-tight text-accent-lime">This Month</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[300px] w-full relative group/chart">
                        <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#BACD38" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#BACD38" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            {[0, 1, 2, 3].map(i => (
                                <line key={i} x1="0" y1={i * 100} x2="1000" y2={i * 100} stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
                            ))}
                            {stats.salesChartData.length > 0 && (
                                <>
                                    <path 
                                        d={`M 0 300 ${stats.salesChartData.map((d, i) => `L ${(i / 6) * 1000} ${300 - (d.total / Math.max(...stats.salesChartData.map(x => x.total), 1)) * 250}`).join(' ')} L 1000 300 Z`} 
                                        fill="url(#chartGradient)"
                                        className="transition-all duration-1000"
                                    />
                                    <path 
                                        d={`M 0 ${300 - (stats.salesChartData[0]?.total / Math.max(...stats.salesChartData.map(x => x.total), 1)) * 250} ${stats.salesChartData.map((d, i) => `L ${(i / 6) * 1000} ${300 - (d.total / Math.max(...stats.salesChartData.map(x => x.total), 1)) * 250}`).join(' ')}`} 
                                        fill="none" 
                                        stroke="#BACD38" 
                                        strokeWidth="4" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                        className="animate-draw"
                                        style={{ strokeDasharray: 2000, strokeDashoffset: 2000, animation: 'draw 2s ease-out forwards' }}
                                    />
                                </>
                            )}
                        </svg>
                        <style>{`
                            @keyframes draw { to { strokeDashoffset: 0; } }
                        `}</style>
                    </div>
                </div>

                {/* ── Category Distribution ────────────────────────────── */}
                <div className="bg-white p-8 rounded-[40px] border border-black/5 shadow-xl shadow-black/5">
                    <h2 className="text-xl font-black tracking-tight uppercase italic mb-8">Top Categories</h2>
                    <div className="flex flex-col items-center">
                        <div className="relative w-48 h-48 mb-8">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="3.5" />
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#BACD38" strokeWidth="3.5" strokeDasharray="65 100" />
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3.5" strokeDasharray="25 100" strokeDashoffset="-65" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black italic tracking-tighter">74%</span>
                                <span className="text-[8px] font-black text-black/30 uppercase tracking-widest">Growth</span>
                            </div>
                        </div>
                        <div className="w-full space-y-4">
                            {stats.categoryDist.length > 0 ? stats.categoryDist.map((cat, idx) => (
                                <div key={cat.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${['bg-accent-lime', 'bg-blue-500', 'bg-purple-500'][idx]}`} />
                                        <span className="text-[10px] font-black uppercase text-black/60">{cat.name}</span>
                                    </div>
                                    <span className="text-[10px] font-black">{cat.percentage}%</span>
                                </div>
                            )) : (
                                <div className="text-[10px] text-black/20 italic text-center py-4">No data available</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ── Activity Log ────────────────────────────────────── */}
                <div className="bg-white p-8 rounded-[40px] border border-black/5 shadow-xl shadow-black/5">
                    <h2 className="text-xl font-black tracking-tight uppercase italic mb-8">Operational Stream</h2>
                    <div className="space-y-6">
                        {loading ? (
                            <div className="animate-pulse space-y-4">
                                {[1,2,3,4].map(n => <div key={n} className="h-16 bg-black/5 rounded-3xl" />)}
                            </div>
                        ) : orders.length > 0 ? orders.slice(0, 5).map((order, i) => (
                            <div key={order.id} className="flex items-center gap-4 p-4 rounded-3xl bg-black/5 border border-black/5 hover:border-accent-lime/20 transition-all hover:bg-white group/activity">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-600' : 
                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                }`}>
                                    {order.status === 'DELIVERED' ? <Package size={18} /> : 
                                     order.status === 'CANCELLED' ? <AlertCircle size={18} /> : <ShoppingBag size={18} />}
                                </div>
                                <div className="flex-1">
                                    <div className="text-[11px] font-black uppercase tracking-tight text-black/80">Order #{order.orderNumber?.slice(-5) || order.id.slice(-5)}</div>
                                    <div className="text-[9px] font-bold text-black/30 uppercase mt-0.5">
                                        {new Date(order.createdAt).toLocaleDateString()} · {order.status}
                                    </div>
                                </div>
                                <div className="text-[11px] font-black tracking-tight italic bg-white px-3 py-1.5 rounded-xl border border-black/5 group-hover/activity:border-accent-lime/20 transition-colors">
                                    £{Number(order.totalAmount || 0).toFixed(2)}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-black/20 italic">No operational activity yet.</div>
                        )}
                    </div>
                </div>

            </div>
        </SupplierDashboardLayout>
    );
};

export default SupplierOverviewPage;
