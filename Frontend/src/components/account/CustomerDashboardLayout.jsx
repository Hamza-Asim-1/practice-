import React, { useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogOut, ChevronRight, Package, ShoppingBag, Star, Shield, User, Home, LayoutDashboard, ArrowRight } from 'lucide-react';

/* ── Noise SVG ─────────────────────────────────────────────────────────────── */
const NOISE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

/* ── Membership card ───────────────────────────────────────────────────────── */
const MemberCard = ({ user }) => {
    const ref = useRef(null);
    const onMove = (e) => {
        const el = ref.current; if (!el) return;
        const { left, top, width, height } = el.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 9}deg) scale3d(1.03,1.03,1.03)`;
    };
    const onLeave = () => { if (ref.current) ref.current.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)'; };

    return (
        <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
            className="relative w-full h-[200px] rounded-2xl overflow-hidden cursor-default select-none"
            style={{ transition: 'transform 0.18s ease', transformStyle: 'preserve-3d' }}>
            {/* BG */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#141a06,#0d1305 45%,#182007)' }} />
            {/* Noise */}
            <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
                style={{ backgroundImage: NOISE, backgroundSize: '160px 160px' }} />
            {/* Shimmer */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(120deg,transparent 35%,rgba(192,215,45,0.09) 52%,transparent 68%)' }} />
            {/* Glow */}
            <div className="absolute -top-6 -right-6 w-36 h-36 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle,rgba(192,215,45,0.2),transparent 70%)' }} />
            {/* Chip */}
            <div className="absolute top-5 left-5 w-9 h-6 rounded border border-accent-lime/25"
                style={{ background: 'linear-gradient(135deg,rgba(192,215,45,0.13),rgba(192,215,45,0.04))' }}>
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-accent-lime/20" />
                <div className="absolute top-1/2 left-0 right-0 h-px bg-accent-lime/20" />
            </div>
            {/* Brand */}
            <div className="absolute top-5 right-5 text-accent-lime font-black text-lg tracking-[5px] opacity-80">TEZA</div>
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-end justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="text-white/25 text-[8px] md:text-[9px] font-bold uppercase tracking-[2px] md:tracking-[3px] mb-0.5">Member</div>
                        <div className="text-white font-black text-sm md:text-sm truncate pr-2">
                            {user?.name || user?.email?.split('@')[0] || 'Customer'}
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <div className="text-white/25 text-[8px] md:text-[9px] font-bold uppercase tracking-[2px] mb-0.5">Total Spent</div>
                        <div className="text-accent-lime font-black text-sm md:text-base italic">
                            £{Number(user?.totalSpent || 0).toFixed(2)}
                        </div>
                    </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/10 flex justify-between items-center">
                    <div className="text-white/20 text-[8px] md:text-[9px] font-mono tracking-widest">
                        •••• •••• {String(user?.id || '0000').slice(-4).padStart(4, '0')}
                    </div>
                    <div className="text-accent-lime text-[8px] md:text-[9px] font-black uppercase tracking-wider flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                        <Star size={8} fill="currentColor" /> {user?.role === 'CUSTOMER' ? 'Customer' : 'Premium'}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CustomerDashboardLayout = ({ children, title }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [totalSpent, setTotalSpent] = React.useState(0);

    React.useEffect(() => {
        if (!user) return;
        fetch(`${import.meta.env.VITE_API_BASE}/orders/mine`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const total = data.reduce((acc, order) => acc + Number(order.totalAmount || 0), 0);
                    setTotalSpent(total);
                }
            })
            .catch(err => console.error('Error fetching orders for total spent:', err));
    }, [user]);

    // Close sidebar on route change
    React.useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    if (!user) return (
        <section className="pt-32 md:pt-[140px] pb-16 md:pb-[100px] bg-[#F8F9FA] min-h-screen text-[#1C1D1D] flex items-center justify-center">
            <div className="text-center max-w-[380px] mx-auto px-6">
                <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-8">
                    <div className="absolute inset-0 rounded-full bg-accent-lime/10 animate-ping" style={{ animationDuration: '2s' }} />
                    <div className="relative w-full h-full rounded-full bg-accent-lime/10 border border-accent-lime/30 flex items-center justify-center">
                        <Shield size={24} md:size={28} className="text-accent-lime" />
                    </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-[-1px] mb-3">Member Portal</h2>
                <p className="text-black/30 text-sm leading-relaxed mb-8 font-medium">Sign in to access your orders, track deliveries and manage your profile.</p>
                <Link to="/login" className="lime-btn px-10 py-3.5 font-black tracking-widest text-sm no-underline inline-flex items-center gap-2">
                    SIGN IN <ChevronRight size={15} />
                </Link>
            </div>
        </section>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#1C1D1D] flex flex-col">
            {/* ══ DASHBOARD HEADER ═══════════════════════════════════════════ */}
            <header className="fixed top-0 left-0 right-0 h-[80px] bg-white/80 backdrop-blur-xl border-b border-black/5 z-1100 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent-lime/10 flex items-center justify-center">
                        <User size={16} className="text-accent-lime" />
                    </div>
                    <span className="text-sm font-black tracking-widest uppercase">Portal</span>
                </div>
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="lg:hidden w-10 h-10 rounded-xl bg-black/5 border border-black/5 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                    <div className={`w-5 h-0.5 bg-black transition-all ${isSidebarOpen ? 'rotate-45 translate-y-2' : ''}`} />
                    <div className={`w-5 h-0.5 bg-black transition-all ${isSidebarOpen ? 'opacity-0' : ''}`} />
                    <div className={`w-5 h-0.5 bg-black transition-all ${isSidebarOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </button>
            </header>

            <div className="flex flex-1 pt-[80px]">
                {/* ══ SIDEBAR OVERLAY ═══════════════════════════════════════════ */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-1200 lg:hidden animate-in fade-in duration-300"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* ══ LEFT SIDEBAR ═══════════════════════════════════════════ */}
                <aside className={`fixed lg:sticky top-0 lg:top-[80px] left-0 bottom-0 h-full lg:h-[calc(100vh-80px)] w-[300px] xl:w-[340px] shrink-0
                                  border-r border-black/5 z-1300 lg:z-50
                                  flex flex-col bg-white transform transition-transform duration-500 ease-out
                                  ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                    {/* Top area with gradient */}
                    <div className="relative p-8 pb-10 overflow-hidden shrink-0">
                        <div className="absolute inset-0"
                            style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%,rgba(192,215,45,0.07),transparent 70%)' }} />
                        <div className="absolute inset-0 opacity-[0.025]"
                            style={{ backgroundImage: NOISE, backgroundSize: '160px 160px' }} />

                        {/* Avatar */}
                        <div className="relative z-10 flex flex-col items-center text-center mb-6">
                            <div className="font-black text-xl tracking-[-0.5px]">
                               <span className="text-black/30 font-mono text-xs">Username:</span> {user?.name || user?.email?.split('@')[0] || 'Customer'}
                            </div>
                            <div className="text-black/30 text-xs mt-1 font-mono uppercase tracking-wider">Email: {user?.email}</div>
                        </div>

                        {/* Membership card */}
                        <div className="relative z-10">
                            <MemberCard user={{ ...user, totalSpent }} />
                        </div>
                    </div>

                    <div className="mx-6 h-px bg-black/5 shrink-0" />

                    {/* Nav */}
                    <nav className="flex flex-col gap-1 p-5 flex-1 overflow-y-auto">
                        {[
                            { icon: Home, label: 'Back to Home', to: '/' },
                            { icon: LayoutDashboard, label: 'Overview', to: '/account' },
                            { icon: Package, label: 'My Orders', to: '/account/orders' },
                            { icon: ShoppingBag, label: 'Browse Products', to: '/products' },
                        ].map(({ icon: Icon, label, to }) => {
                            const isActive = pathname === to;
                            return (
                                <Link key={to} to={to}
                                    className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all no-underline ${isActive ? 'bg-black/5 border-black/5 shadow-sm' : 'border-transparent hover:bg-black/[0.02] hover:border-black/5'}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isActive ? 'bg-accent-lime text-black shadow-[0_4px_12px_rgba(186,205,56,0.3)]' : 'bg-black/5 text-black/40 group-hover:bg-accent-lime group-hover:text-black group-hover:shadow-[0_4px_12px_rgba(186,205,56,0.3)]'}`}>
                                        <Icon size={15} strokeWidth={isActive ? 2.5 : 1.8} />
                                    </div>
                                    <span className={`text-sm font-bold transition-colors ${isActive ? 'text-[#1C1D1D]' : 'text-black/50 group-hover:text-black'}`}>{label}</span>
                                    {!isActive && <ChevronRight size={13} className="ml-auto text-black/10 group-hover:text-black/30 group-hover:translate-x-0.5 transition-all" />}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-5 border-t border-black/5 shrink-0">
                        <button onClick={() => { logout(); navigate('/'); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-black/25 text-sm font-bold hover:text-red-600 hover:bg-red-500/5 transition-all cursor-pointer bg-transparent border-none uppercase tracking-widest">
                            <LogOut size={15} /> Sign Out
                        </button>
                    </div>
                </aside>

                {/* ══ MAIN CONTENT ═══════════════════════════════════════════ */}
                <main className="flex-1 p-6 md:p-12 xl:p-16 overflow-y-auto bg-[#F8F9FA]">
                    <div className="mb-8 md:mb-10">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent-lime animate-pulse shadow-[0_0_8px_rgba(186,205,56,0.5)]" />
                            <span className="text-accent-lime text-[9px] md:text-[10px] font-black uppercase tracking-[3px] md:tracking-[4px]">DASHBOARD</span>
                        </div>
                        <h1 className="text-3xl md:text-[38px] font-black tracking-[-1px] md:tracking-[-1.5px] leading-tight md:leading-none truncate text-[#1C1D1D]">
                            {title}
                        </h1>
                    </div>

                    {/* Inject Tab Content */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CustomerDashboardLayout;
