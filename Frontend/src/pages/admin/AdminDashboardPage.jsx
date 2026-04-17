import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    TrendingUp, 
    ShoppingBag, 
    Beef, 
    Users, 
    Plus, 
    ChevronRight,
    ArrowUpRight,
    Search,
    TrendingDown,
    Activity,
    ChevronDown,
    Tag
} from 'lucide-react';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { ORDER_STATUS_CONFIG } from '../../config/orders';



const API_BASE = import.meta.env.VITE_API_BASE;

const AdminDashboardPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({ 
        orders: 0, 
        suppliers: 0, 
        customers: 0, 
        products: 0, 
        users: 0,
        totalSales: 0,
        recentActivity: [],
        salesChartData: []
    });
    const [loading, setLoading] = useState(true);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

    const fetchStats = () => {
        setLoading(true);
        const opts = { credentials: 'include' };
        Promise.all([
            fetch(`${API_BASE}/orders`, opts).then(r => r.json()),
            fetch(`${API_BASE}/suppliers`, opts).then(r => r.json()),
            fetch(`${API_BASE}/customers`, opts).then(r => r.json()),
            fetch(`${API_BASE}/products`).then(r => r.json()),
            fetch(`${API_BASE}/users`, opts).then(r => r.json()),
        ]).then(([orders, suppliers, customers, products, users]) => {
            const ordersList = Array.isArray(orders) ? orders : [];
            const totalSales = ordersList.reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);
            
            // Generate sales chart data (last 7 days)
            const last7Days = [...Array(7)].map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const dateStr = date.toISOString().split('T')[0];
                const dayTotal = ordersList
                    .filter(o => o.createdAt?.startsWith(dateStr))
                    .reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);
                return { date: dateStr, total: dayTotal };
            });

            // Combine recent activity
            const activity = [
                ...ordersList.map(o => ({ 
                    type: 'ORDER', 
                    title: `Order #${o.id.slice(-5).toUpperCase()}`, 
                    detail: `Total: £${Number(o.totalAmount || 0).toFixed(2)}`,
                    time: new Date(o.createdAt),
                    positive: true,
                    status: o.status
                })),
                ...(Array.isArray(users) ? users : []).map(u => ({
                    type: 'USER',
                    title: 'New Registration',
                    detail: u.email,
                    time: new Date(u.createdAt),
                    positive: false
                })),
                ...(Array.isArray(suppliers) ? suppliers : []).map(s => ({
                    type: 'SUPPLIER',
                    title: 'New Supplier',
                    detail: s.name,
                    time: new Date(s.createdAt),
                    positive: false
                }))
            ].sort((a, b) => b.time - a.time).slice(0, 5);

            setStats({
                orders: ordersList.length,
                suppliers: Array.isArray(suppliers) ? suppliers.length : 0,
                customers: Array.isArray(customers) ? customers.length : 0,
                products: products?.total ?? (Array.isArray(products?.data) ? products.data.length : 0),
                users: Array.isArray(users) ? users.length : 0,
                totalSales,
                recentActivity: activity,
                salesChartData: last7Days
            });
            setLoading(false);
        }).catch(() => { setLoading(false); });
    };

    useEffect(() => {
        if (user) fetchStats();
    }, [user]);

    const SimpleChart = ({ data }) => {
        if (!data || data.length === 0) return null;
        const max = Math.max(...data.map(d => d.total), 1);
        const points = data.map((d, i) => `${(i / 6) * 100},${100 - (d.total / max) * 80}`).join(' ');
        
        return (
            <div className="h-24 w-full mt-4 flex items-end gap-1">
                <svg viewBox="0 0 100 100" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                    <polyline
                        fill="none"
                        stroke="#c0d72d"
                        strokeWidth="2"
                        points={points}
                        strokeLinecap="round"
                    />
                    {data.map((d, i) => (
                        <circle 
                            key={i} 
                            cx={(i / 6) * 100} 
                            cy={100 - (d.total / max) * 80} 
                            r="2" 
                            fill="#c0d72d" 
                        />
                    ))}
                </svg>
            </div>
        );
    };


    return (
        <>
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title text-2xl md:text-3xl">Dashboard</h1>
                    <p className="text-black/60 text-[10px] md:text-[11px] font-black uppercase tracking-widest mt-2">Overview of your business</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-initial bg-black/5 hover:bg-black/10 text-text-cream text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg border border-black/5 transition-all">Export</button>
                    <button 
                        className="flex-1 md:flex-initial bg-accent-lime text-black text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg shadow-lime transition-all"
                        onClick={() => fetchStats()}
                    >Refresh</button>
                </div>
            </div>

            {loading ? (
                <div className="py-20">
                    <LoadingSpinner message="Loading dashboard..." />
                </div>
            ) : (
                <>

            <div className="admin-stat-grid">
                <div className="admin-card stat-card relative group min-h-[160px]">
                    <div className="absolute top-6 right-6 text-[#c0d72d] opacity-20 group-hover:opacity-100 transition-opacity">
                        <TrendingUp size={24} />
                    </div>
                    <h4>Total Sales</h4>
                    <div className="stat-value text-3xl md:text-[40px] text-lime">£{Number(stats.totalSales || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <div className="stat-delta positive">
                        Based on {stats.orders} orders
                    </div>
                    <SimpleChart data={stats.salesChartData} />
                </div>
                
                <div className="admin-card stat-card relative group">
                    <div className="absolute top-6 right-6 text-black/10 group-hover:text-accent-lime transition-colors">
                        <ShoppingBag size={24} />
                    </div>
                    <h4>Total Orders</h4>
                    <div className="stat-value text-3xl md:text-[40px] text-text-cream">{stats.orders}</div>
                    <div className="stat-delta">
                        Orders placed
                    </div>
                </div>

                <div className="admin-card stat-card relative group">
                    <div className="absolute top-6 right-6 text-black/10 group-hover:text-accent-lime transition-colors">
                        <Beef size={24} />
                    </div>
                    <h4>Stock Items</h4>
                    <div className="stat-value text-3xl md:text-[40px] text-text-cream">{stats.products}</div>
                    <div className="stat-delta positive">
                        Products
                    </div>
                </div>

                <div className="admin-card stat-card relative group">
                    <div className="absolute top-6 right-6 text-black/10 group-hover:text-accent-lime transition-colors">
                        <Users size={24} />
                    </div>
                    <h4>Customers</h4>
                    <div className="stat-value text-3xl md:text-[40px] text-text-cream">{stats.customers}</div>
                    <div className="stat-delta positive">
                        <Plus size={10} className="inline mr-1" />
                        42 New
                    </div>
                </div>
            </div>

            <div className="dashboard-metrics">
                <div className="admin-card flex-[2.5]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-black uppercase tracking-widest text-black/60 italic m-0">Recent Activity</h3>
                        <button className="text-accent-lime text-[10px] font-black uppercase tracking-widest hover:underline">View Logs</button>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Activity</th>
                                    <th className="hidden sm:table-cell">Details</th>
                                    <th className="hidden md:table-cell">Time</th>
                                    <th className="text-right">View</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentActivity.length > 0 ? stats.recentActivity.map((row, i) => (
                                    <tr key={i} className="group/row">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${row.positive ? 'shadow-sm' : 'bg-black/20'}`} 
                                                    style={row.type === 'ORDER' ? { 
                                                        backgroundColor: ORDER_STATUS_CONFIG[row.status]?.color || '#94a3b8',
                                                        boxShadow: `0 0 10px ${ORDER_STATUS_CONFIG[row.status]?.color}40`
                                                    } : {}}
                                                />
                                                <div className="flex flex-col">
                                                    <span className={`text-[11px] font-black tracking-tight ${row.positive ? 'text-accent-lime' : 'text-text-cream'}`}>{row.type}</span>
                                                    <span className="sm:hidden text-[10px] text-black/40 font-bold">{row.title}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hidden sm:table-cell">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-bold text-text-cream">{row.title}</span>
                                                <span className="text-[11px] text-black/30">{row.detail}</span>
                                            </div>
                                        </td>
                                        <td className="hidden md:table-cell text-[12px] font-bold text-black/30 italic uppercase">
                                            {(() => {
                                                const diff = Math.floor((new Date() - row.time) / 1000 / 60);
                                                if (diff < 1) return 'Just now';
                                                if (diff < 60) return `${diff}m ago`;
                                                if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
                                                return `${Math.floor(diff / 1440)}d ago`;
                                            })()}
                                        </td>
                                        <td className="text-right">
                                            <button className="text-black/20 hover:text-black transition-colors p-2">
                                                <ChevronRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-10 text-black/20 italic">No recent activity detected.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="admin-card flex-1">
                    <h3 className="text-sm font-black uppercase tracking-widest text-black/40 italic mb-8">Quick Actions</h3>
                    <div className="flex flex-col gap-3 relative">
                        {/* Add New Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                                className={`dashboard-action-btn w-full group ${isAddMenuOpen ? 'bg-black/10' : ''}`}
                            >
                                <span className="flex items-center gap-3">
                                    <Plus size={18} className="text-accent-lime" />
                                    <span>Add New</span>
                                </span>
                                <ChevronDown size={14} className={`transition-transform duration-300 ${isAddMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isAddMenuOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setIsAddMenuOpen(false)}
                                    />
                                    <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white border border-black/5 rounded-2xl shadow-xl z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <button 
                                            onClick={() => navigate('/admin/products')}
                                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-black/5 transition-colors group/item"
                                        >
                                            <span className="flex items-center gap-3">
                                                <Beef size={16} className="text-black/20 group-hover/item:text-accent-lime" />
                                                <span className="text-[11px] font-black uppercase tracking-widest">Product</span>
                                            </span>
                                            <Plus size={12} className="text-black/10" />
                                        </button>
                                        <button 
                                            onClick={() => navigate('/admin/categories')}
                                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-black/5 transition-colors group/item"
                                        >
                                            <span className="flex items-center gap-3">
                                                <Tag size={16} className="text-black/20 group-hover/item:text-accent-lime" />
                                                <span className="text-[11px] font-black uppercase tracking-widest">Category</span>
                                            </span>
                                            <Plus size={12} className="text-black/10" />
                                        </button>
                                        <button 
                                            onClick={() => navigate('/admin/suppliers')}
                                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-black/5 transition-colors group/item"
                                        >
                                            <span className="flex items-center gap-3">
                                                <Users size={16} className="text-black/20 group-hover/item:text-accent-lime" />
                                                <span className="text-[11px] font-black uppercase tracking-widest">Supplier</span>
                                            </span>
                                            <Plus size={12} className="text-black/10" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <button 
                            onClick={() => navigate('/admin/orders')}
                            className="dashboard-action-btn group"
                        >
                            <span className="flex items-center gap-3">
                                <Search size={18} className="text-black/20 group-hover:text-accent-lime transition-colors" />
                                <span>Search Records</span>
                            </span>
                            <ChevronRight size={14} className="text-black/20" />
                        </button>

                        <div className="mt-4 p-5 bg-black/5 border border-black/5 rounded-2xl relative overflow-hidden group/note">
                            <div className="absolute top-0 right-0 p-2">
                                <TrendingUp size={48} className="text-accent-lime opacity-5 -mr-4 -mt-4 rotate-12 group-hover/note:opacity-10 transition-opacity" />
                            </div>
                            <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-black/40 mb-2">Internal Note</h4>
                            <p className="text-[10px] text-black/60 leading-relaxed font-bold mb-4 italic">
                                "System performance is optimal. Ensure all pending supplier applications are reviewed within 24 hours."
                            </p>
                            <button 
                                onClick={() => navigate('/admin/suppliers')}
                                className="w-full py-2 bg-black text-accent-lime text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-black/80 transition-all flex items-center justify-center gap-2"
                            >
                                Review Applications <ArrowUpRight size={12} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            </>
        )}
        </>
    );
};

export default AdminDashboardPage;
