import React, { useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogOut, ChevronRight, Package, LayoutDashboard, User, Home, Star, Briefcase, PlusCircle } from 'lucide-react';

/* ── Noise SVG ─────────────────────────────────────────────────────────────── */
const NOISE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

/* ── Business identity card (Supplier specific) ────────────────────────────── */
const BusinessCard = ({ user }) => {
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
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#0d0d0d,#1a1a1a 45%,#050505)' }} />
            <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
                style={{ backgroundImage: NOISE, backgroundSize: '160px 160px' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(120deg,transparent 35%,rgba(186,205,56,0.05) 52%,transparent 68%)' }} />
            
            {/* Top Right Logo */}
            <div className="absolute top-5 right-5 text-accent-lime font-black text-lg tracking-[5px] opacity-80">PARTNER</div>
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-end justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="text-accent-lime text-[8px] md:text-[9px] font-bold uppercase tracking-[3px] mb-0.5">Verified Supplier</div>
                        <div className="text-white font-black text-sm md:text-base truncate pr-2 uppercase">
                            {user?.supplier?.name || user?.businessName || 'TEZA PARTNER'}
                        </div>
                    </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/10 flex justify-between items-center text-white/40">
                    <div className="text-[8px] md:text-[9px] font-mono tracking-widest">
                        REG: {String(user?.id || '0000').slice(-8).toUpperCase()}
                    </div>
                    <div className="text-[8px] md:text-[9px] font-black uppercase tracking-wider flex items-center gap-1 bg-accent-lime/10 text-accent-lime px-2 py-0.5 rounded-full border border-accent-lime/20">
                        <Briefcase size={8} fill="currentColor" /> {user?.role === 'SUPPLIER_ADMIN' ? 'Supplier' : 'Admin'}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SupplierDashboardLayout = ({ children, title }) => {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    // Close sidebar on route change
    React.useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-bg-dark text-white p-6">
                <div className="w-12 h-12 rounded-2xl border-2 border-accent-lime/20 border-t-accent-lime animate-spin mb-4" />
                <p className="text-black/40 text-[10px] font-black uppercase tracking-[4px] animate-pulse">Syncing Session...</p>
            </div>
        );
    }

    if (!user || user.role !== 'SUPPLIER_ADMIN') {
        return (
            <div className="h-screen flex items-center justify-center bg-bg-dark text-white p-6">
                <div className="text-center">
                    <h2 className="text-2xl font-black mb-4">Unauthorized</h2>
                    <Link to="/" className="text-accent-lime underline">Back to Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-darker text-text-cream flex flex-col">
            <header className="fixed top-0 left-0 right-0 h-[80px] bg-white/80 backdrop-blur-xl border-b border-black/5 z-40 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                        <Briefcase size={16} />
                    </div>
                    <span className="text-sm font-black tracking-widest uppercase">Supplier Portal</span>
                </div>
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="lg:hidden w-10 h-10 rounded-xl bg-black/5 flex flex-col items-center justify-center gap-1.5"
                >
                    <div className={`w-5 h-0.5 bg-black transition-all ${isSidebarOpen ? 'rotate-45 translate-y-2' : ''}`} />
                    <div className={`w-5 h-0.5 bg-black transition-all ${isSidebarOpen ? 'opacity-0' : ''}`} />
                    <div className={`w-5 h-0.5 bg-black transition-all ${isSidebarOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </button>
            </header>

            <div className="flex flex-1 pt-[80px]">
                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
                )}

                {/* Sidebar */}
                <aside className={`fixed lg:sticky top-0 lg:top-[80px] left-0 bottom-0 h-full lg:h-[calc(100vh-80px)] w-[300px] border-r border-black/5 z-60 lg:z-30 flex flex-col bg-white transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                    <div className="p-8 pb-10">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="font-black text-lg truncate w-full uppercase tracking-tighter">
                                {user?.name || user?.email?.split('@')[0]}
                            </div>
                            <div className="text-black/30 text-[10px] font-mono mt-1">{user?.email}</div>
                        </div>
                        <BusinessCard user={user} />
                    </div>

                    <nav className="flex flex-col gap-1 p-5 flex-1 overflow-y-auto">
                        {[
                            { icon: Home, label: 'Back to Home', to: '/' },
                            { icon: LayoutDashboard, label: 'Overview', to: '/supplier/dashboard' },
                            { icon: Package, label: 'Orders', to: '/supplier/orders' },
                        ].map(({ icon: Icon, label, to }) => {
                            const isActive = pathname === to;
                            return (
                                <Link 
                                    key={to} 
                                    to={to} 
                                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all no-underline ${
                                        isActive 
                                            ? 'bg-black text-accent-lime! border-black shadow-lg shadow-black/10' 
                                            : 'border-transparent text-black/40 hover:text-black hover:bg-black/5'
                                    }`}
                                >
                                    <Icon size={18} />
                                    <span className="text-sm font-bold uppercase tracking-wider">{label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-5 border-t border-black/5">
                        <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-black tracking-widest text-xs rounded-xl hover:bg-red-50 uppercase">
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                </aside>

                <main className="flex-1 p-6 md:p-12 bg-bg-darker">
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-accent-lime" />
                            <span className="text-black/40 text-[10px] font-black tracking-[4px] uppercase">Supplier Section</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase">{title}</h1>
                    </div>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default SupplierDashboardLayout;
