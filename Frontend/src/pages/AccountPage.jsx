import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Shield, Zap, Mail, ArrowRight, Package, ShoppingBag, ChevronRight } from 'lucide-react';
import CustomerDashboardLayout from '../components/account/CustomerDashboardLayout';
import { StatsSkeleton, OrderListSkeleton, ProfileSkeleton } from '../components/account/DashboardSkeleton';

const API_BASE = import.meta.env.VITE_API_BASE;

/* ── Animated counter ──────────────────────────────────────────────────────── */
const useCounter = (target, duration = 1400) => {
    const [val, setVal] = useState(0);
    useEffect(() => {
        let start = null;
        const step = (ts) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setVal(Math.floor(ease * target));
            if (p < 1) requestAnimationFrame(step);
        };
        const raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [target, duration]);
    return val;
};

/* ── Big stat block ────────────────────────────────────────────────────────── */
const StatBlock = ({ value, label, prefix = '', color, duration = 1400, sparklineData = [] }) => {
    const count = useCounter(typeof value === 'number' ? value : 0, duration);
    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <div className="text-2xl md:text-3xl font-black italic tracking-tighter" style={{ color }}>{prefix}{count.toLocaleString()}</div>
                {sparklineData.length > 0 && (
                    <svg className="w-12 h-6" viewBox="0 0 50 20">
                        <path 
                            d={`M ${sparklineData.map((d, i) => `${(i * 50) / (sparklineData.length - 1)} ${20 - (d / Math.max(...sparklineData)) * 15}`).join(' L ')}`}
                            fill="none"
                            stroke={color}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </div>
            <div className="text-black/30 text-[9px] sm:text-[10px] font-black uppercase tracking-[2px]">{label}</div>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════════════════════
   ACCOUNT PAGE (OVERVIEW TAB)
   ══════════════════════════════════════════════════════════════════════════════ */
const AccountPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { setLoading(false); return; }
        if (user.role === 'SUPPLIER_ADMIN') {
            navigate('/supplier/dashboard');
            return;
        }
        fetch(`${API_BASE}/orders/mine`, { credentials: 'include' })
            .then(r => r.json())
            .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [user]);

    if (!user) return null;

    const totalSpent   = orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0);
    const delivered    = orders.filter(o => o.status === 'DELIVERED').length;
    const recentOrders = orders.slice(0, 4);

    return (
        <CustomerDashboardLayout title={user.role === 'SUPPLIER_ADMIN' ? 'Supplier Overview' : 'Dashboard'}>
            
            {/* ── Stats row ─────────────────────────────────────────── */}
            {loading ? (
                <StatsSkeleton />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-10">
                    {[
                        { v: orders.length, label:'Total Orders',   color:'#BACD38', prefix:'', spark: [4, 8, 3, 10, 6, 12, 15] },
                        { v: delivered,     label:'Delivered',      color:'#22c55e', prefix:'', spark: [2, 5, 2, 8, 4, 10, 12] },
                        { v: totalSpent,    label:'Total Spent',    color:'#eab308', prefix:'£', spark: [100, 250, 150, 400, 300, 600, 800] },
                    ].map(({ v, label, color, prefix, spark }) => (
                        <div key={label} className="p-5 md:p-6 rounded-3xl bg-white border border-black/5 hover:border-accent-lime/20 shadow-xl shadow-black/5 transition-all group">
                            <StatBlock value={v} label={label} color={color} prefix={prefix} sparklineData={spark} />
                        </div>
                    ))}
                </div>
            )}

            {/* ── Spending Insights (Charts) ────────────────────────── */}
            {!loading && orders.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div className="bg-white p-8 rounded-[40px] border border-black/5 shadow-xl shadow-black/5">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-black tracking-tight uppercase italic">Spending Trend</h2>
                            <span className="text-[9px] font-black bg-black/5 px-2 py-1 rounded-full text-black/40">LAST 6 MONTHS</span>
                        </div>
                        <div className="h-40 w-full relative">
                            <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                                <path 
                                    d="M 0 80 L 80 60 L 160 75 L 240 40 L 320 55 L 400 20" 
                                    stroke="#BACD38" 
                                    strokeWidth="3" 
                                    fill="none" 
                                    strokeLinecap="round"
                                />
                                <path 
                                    d="M 0 80 L 80 60 L 160 75 L 240 40 L 320 55 L 400 20 L 400 100 L 0 100 Z" 
                                    fill="rgba(186,205,56,0.05)"
                                />
                                {[0, 80, 160, 240, 320, 400].map(x => (
                                    <circle key={x} cx={x} cy={x === 0 ? 80 : x === 80 ? 60 : x === 160 ? 75 : x === 240 ? 40 : x === 320 ? 55 : 20} r="3" fill="white" stroke="#BACD38" strokeWidth="2" />
                                ))}
                            </svg>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[40px] border border-black/5 shadow-xl shadow-black/5">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-black tracking-tight uppercase italic">Category Split</h2>
                            <span className="text-[9px] font-black bg-black/5 px-2 py-1 rounded-full text-black/40">TOP CHOICE</span>
                        </div>
                        <div className="space-y-4">
                            {[
                                { name: 'Beef', p: 65, color: '#BACD38' },
                                { name: 'Lamb', p: 25, color: '#3b82f6' },
                                { name: 'Poultry', p: 10, color: '#8b5cf6' },
                            ].map(cat => (
                                <div key={cat.name}>
                                    <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                                        <span>{cat.name}</span>
                                        <span>{cat.p}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${cat.p}%`, backgroundColor: cat.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Recent Orders ─────────────────────────────────────── */}
            <div>
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-[2px] bg-accent-lime" />
                        <span className="text-black/30 text-[10px] md:text-[11px] font-black uppercase tracking-[3px]">Recent Orders</span>
                    </div>
                    <Link to="/account/orders"
                          className="text-black/30 text-[10px] md:text-xs font-black uppercase tracking-widest hover:text-accent-lime transition-colors no-underline flex items-center gap-1">
                        View All <ArrowRight size={12} />
                    </Link>
                </div>

                {loading ? (
                    <OrderListSkeleton count={4} />
                ) : recentOrders.length === 0 ? (
                    <div className="py-12 md:py-16 rounded-2xl border border-dashed border-black/10 text-center px-6">
                        <Package size={28} className="mx-auto mb-3 text-black/10" />
                        <p className="text-black/30 text-sm font-bold mb-4">No orders yet.</p>
                        <Link to="/products" className="lime-btn px-6 py-2.5 text-xs font-black tracking-widest no-underline inline-flex items-center gap-2">
                            <ShoppingBag size={13} /> Shop Now
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {recentOrders.map(order => {
                            const done = order.status === 'DELIVERED';
                            const cancelled = ['CANCELLED', 'ISSUE_FLAGGED'].includes(order.status);
                            const dotColor = done ? '#22c55e' : cancelled ? '#ef4444' : '#BACD38';
                            return (
                                <Link key={order.id} to={`/orders/${order.id}`}
                                      className="group flex items-center gap-3 md:gap-5 p-4 md:p-5 rounded-2xl border border-black/5 bg-white hover:border-black/10 hover:shadow-md transition-all duration-300 no-underline">
                                    {/* Status dot */}
                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: dotColor, boxShadow: `0 0 8px ${dotColor}40` }} />
                                    {/* Order no */}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-text-cream font-black text-sm tracking-tight truncate">#{order.orderNumber}</div>
                                        <div className="text-black/30 text-[10px] md:text-xs flex items-center gap-1 mt-0.5 font-medium">
                                            <Clock size={10} />
                                            {new Date(order.createdAt).toLocaleDateString('en-GB',{ day:'2-digit', month:'short' })}
                                        </div>
                                    </div>
                                    {/* Status badge */}
                                    <div className="hidden md:block">
                                        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                                              style={{ color: dotColor, background: `${dotColor}10`, border: `1px solid ${dotColor}20` }}>
                                            {order.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    {/* Amount */}
                                    <div className="text-text-cream font-black text-sm md:text-base shrink-0">
                                        £{Number(order.totalAmount).toFixed(2)}
                                    </div>
                                    <ChevronRight size={14} className="text-black/10 group-hover:text-black/30 group-hover:translate-x-0.5 transition-all shrink-0" />
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Account details ───────────────────────────────────── */}
            <div className="mt-10">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-5 h-[2px] bg-accent-lime" />
                    <span className="text-black/30 text-[10px] md:text-[11px] font-black uppercase tracking-[3px]">Account Details</span>
                </div>
                {loading ? (
                    <ProfileSkeleton />
                ) : (
                    <div className="rounded-2xl border border-black/5 bg-white divide-y divide-black/5 shadow-sm overflow-hidden">
                        {[
                            { icon: Mail,   label: 'Email', value: user.email },
                            { icon: Shield, label: 'Role',  value: (user.role || 'Customer').toLowerCase() },
                            { icon: Zap,    label: 'Plan',  value: 'Member' },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-center gap-4 px-5 md:px-6 py-4">
                                <Icon size={14} className="text-black/20 shrink-0" />
                                <span className="text-black/30 text-[10px] md:text-xs font-black uppercase tracking-widest w-16 md:w-20 shrink-0">{label}</span>
                                <span className="text-text-cream text-xs md:text-sm font-semibold capitalize ml-auto truncate pl-4">{value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </CustomerDashboardLayout>
    );
};

export default AccountPage;
