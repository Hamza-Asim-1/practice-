import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
    ClipboardList, ChevronLeft, ShoppingBag, Clock, Truck,
    CheckCircle2, XCircle, AlertCircle, Loader2, ArrowUpRight,
    Package, Filter,
} from 'lucide-react';
import CustomerDashboardLayout from '../components/account/CustomerDashboardLayout';
import { OrderListSkeleton } from '../components/account/DashboardSkeleton';
import {
    ORDER_STATUS_CONFIG,
    ORDER_LIFECYCLE_STEPS,
} from '../config/orders';
import { UI_TEXT } from '../config/ui-text';

const API_BASE = import.meta.env.VITE_API_BASE;

const FILTER_OPTS = ['All', 'Active', 'Delivered', 'Cancelled'];

/* ── Icon map (can't store JSX in siteContent) ──────────────────────────────── */
const STATUS_ICONS = {
    CONFIRMED         : CheckCircle2,
    IN_PREPARATION    : Loader2,
    READY_FOR_PICKUP  : Package,
    OUT_FOR_DELIVERY  : Truck,
    DELIVERED         : CheckCircle2,
    CANCELLED         : XCircle,
    ISSUE_FLAGGED     : AlertCircle,
};

/* ── Progress track ──────────────────────────────────────────────────────── */
const OrderProgress = ({ status }) => {
    const cfg = ORDER_STATUS_CONFIG[status];
    if (!cfg || cfg.lc < 0) return null;
    const step = cfg.lc;

    return (
        <div className="flex items-center gap-0 w-full">
            {ORDER_LIFECYCLE_STEPS.map((s, i) => {
                const done   = i <= step;
                const active = i === step;
                return (
                    <React.Fragment key={s.key}>
                        <div className="flex flex-col items-center gap-1" style={{ flex:'0 0 auto' }}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-500
                                ${done  ? 'border-transparent' : 'border-black/5 bg-transparent'}
                                ${active ? 'ring-2 ring-offset-1 ring-offset-white scale-110' : ''}`}
                                 style={done ? { background: cfg.color, borderColor: cfg.color, boxShadow: active ? `0 0 12px ${cfg.color}60` : 'none' } : {}}>
                                {done && <div className="w-2 h-2 rounded-full bg-black/40" />}
                            </div>
                        </div>
                        {i < ORDER_LIFECYCLE_STEPS.length - 1 && (
                            <div className="flex-1 h-[2px] mx-1 rounded-full overflow-hidden bg-black/5">
                                {i < step && <div className="h-full rounded-full" style={{ background: cfg.color, opacity: 0.6 }} />}
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

/* ── Order card ──────────────────────────────────────────────────────────── */
const OrderCard = ({ order }) => {
    const cfg          = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG['CONFIRMED'];
    const Icon         = STATUS_ICONS[order.status] || CheckCircle2;
    const isCancelled  = cfg.isCancelled;
    const isAwaiting   = cfg.isAwaiting;
    const isSpinning   = order.status === 'IN_PREPARATION';
    const date         = new Date(order.createdAt).toLocaleDateString('en-GB', {
        day:'2-digit', month:'short', year:'numeric',
    });

    return (
        <Link to={`/orders/${order.id}`}
              className="group relative flex flex-col gap-4 md:gap-5 p-5 md:p-6 rounded-2xl border border-black/5 bg-white hover:border-black/10 hover:shadow-lg transition-all duration-300 no-underline overflow-hidden">

            {/* Per-status hover glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                 style={{ background:`radial-gradient(ellipse 60% 50% at 50% 0%, ${cfg.color}08, transparent)` }} />

            {/* Header row */}
            <div className="flex items-start justify-between gap-3 md:gap-4 relative z-10">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 border border-black/5"
                         style={{ background:`${cfg.color}12` }}>
                        <Icon size={16} md:size={18} style={{ color: cfg.color }} className={isSpinning ? 'animate-spin' : ''} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-text-cream font-black text-sm md:text-base tracking-tight truncate">#{order.orderNumber}</span>
                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border shrink-0"
                                  style={{ color:cfg.color, borderColor:`${cfg.color}30`, background:`${cfg.color}10` }}>
                                {cfg.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-black/30 text-[10px] md:text-xs mt-0.5">
                            <Clock size={10} /> {date}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                    <div className="text-text-cream font-black text-base md:text-lg">£{Number(order.totalAmount).toFixed(2)}</div>
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg border border-black/8 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:border-black/20 transition-all duration-300">
                        <ArrowUpRight size={13} md:size={14} className="text-black/40" />
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            {!isCancelled && (
                <div className="relative z-10">
                    <OrderProgress status={order.status} />
                    <div className="hidden sm:flex justify-between mt-3 px-1">
                        {ORDER_LIFECYCLE_STEPS.map((s, i) => {
                            const active = i === cfg.lc;
                            const done = i <= cfg.lc;
                            return (
                                <span key={s.key}
                                      className={`text-[9.5px] font-black uppercase tracking-tighter transition-all duration-300 px-2 py-1 rounded-md
                                      ${active ? 'shadow-sm' : ''}`}
                                      style={{ 
                                          color: active ? cfg.color : done ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)',
                                          background: active ? `${cfg.color}15` : 'transparent',
                                          transform: active ? 'scale(1.05)' : 'scale(1)'
                                      }}>
                                    {s.label}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {(isCancelled || isAwaiting) && (
                <div className="relative z-10 text-[10px] md:text-[11px] font-bold uppercase tracking-widest flex items-center gap-2"
                     style={{ color: cfg.color }}>
                    {isCancelled ? (
                        <><XCircle size={12} /> {cfg.label}</>
                    ) : (
                        <><Clock size={12} /> Action Required: {cfg.label}</>
                    )}
                </div>
            )}
        </Link>
    );
};

/* ══════════════════════════════════════════════════════════════════════════════
   MY ORDERS PAGE
   ══════════════════════════════════════════════════════════════════════════════ */
const MyOrdersPage = () => {
    const { user }  = useAuth();
    const navigate   = useNavigate();
    const [orders, setOrders]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter]   = useState('All');

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetch(`${API_BASE}/orders/mine`, { credentials: 'include' })
            .then(r => r.json())
            .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [user, navigate]);

    const filtered = orders.filter(o => {
        if (filter === 'All')       return true;
        if (filter === 'Delivered') return o.status === 'DELIVERED';
        if (filter === 'Cancelled') return ['CANCELLED','ISSUE_FLAGGED'].includes(o.status);
        if (filter === 'Active')    return !['DELIVERED','CANCELLED','ISSUE_FLAGGED'].includes(o.status);
        return true;
    });


    return (
        <CustomerDashboardLayout title="Order History">
            {/* ── Header details ────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8 md:mb-10 mt-2">
                {[
                    { n: orders.length, l: 'Total', c: '#c0d72d' },
                    { n: orders.filter(o => !['DELIVERED', 'CANCELLED', 'ISSUE_FLAGGED'].includes(o.status)).length, l: 'Active', c: '#fb923c' },
                    { n: orders.filter(o => o.status === 'DELIVERED').length, l: 'Done', c: '#4ade80' },
                ].map(({ n, l, c }) => (
                    <div key={l} className="flex flex-col items-center px-4 md:px-6 py-3 md:py-4 rounded-xl border border-black/5 bg-white shadow-sm">
                        <span className="text-xl md:text-2xl font-black" style={{ color: c }}>{n}</span>
                        <span className="text-black/30 text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-tight">{l}</span>
                    </div>
                ))}
            </div>
            {/* Order cards */}
            {loading ? (
                <OrderListSkeleton count={6} />
            ) : filtered.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {filtered.map(order => <OrderCard key={order.id} order={order} />)}
                </div>
            ) : (
                <div className="py-20 text-center border border-dashed border-black/10 rounded-3xl">
                    <Package size={40} className="mx-auto mb-4 text-black/10" />
                    <p className="text-black/30 font-bold uppercase tracking-widest text-xs">No orders found</p>
                </div>
            )}
        </CustomerDashboardLayout>
    );
};

export default MyOrdersPage;
