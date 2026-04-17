import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    LayoutDashboard, 
    ShoppingBag, 
    Beef, 
    Truck, 
    Users, 
    MapPin, 
    ShieldCheck,
    ArrowLeft,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Tag,
    X
} from 'lucide-react';

const NAV_ITEMS = [
    { path: '/admin',             label: 'Dashboard',    icon: LayoutDashboard },
    { path: '/admin/orders',      label: 'Orders',       icon: ShoppingBag },
    { 
        label: 'Products',     
        icon: Beef,
        children: [
            { path: '/admin/products',   label: 'All Products' },
            { path: '/admin/categories', label: 'Categories' },
        ]
    },
    { path: '/admin/suppliers',   label: 'Suppliers',    icon: Truck },
    { path: '/admin/customers',   label: 'Customers',    icon: Users },
    { path: '/admin/postcodes',   label: 'Postcodes',    icon: MapPin },
    { path: '/admin/users',       label: 'System Users', icon: ShieldCheck },
];

const NavItem = ({ item, collapsedMode, location, isMobileOpen, onCloseMobile }) => {
    const isDropdown = !!item.children;
    const active = isDropdown 
        ? item.children.some(child => location.pathname.startsWith(child.path))
        : (item.path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.path));
    
    const [isOpen, setIsOpen] = React.useState(active);
    
    React.useEffect(() => {
        if (active) setIsOpen(true);
    }, [active]);

    const Icon = item.icon;

    if (isDropdown) {
        return (
            <div className="flex flex-col gap-1">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center ${collapsedMode ? 'justify-center' : 'justify-between'} px-4 py-3.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 group
                        ${active
                            ? 'bg-black text-accent-lime shadow-lg'
                            : 'text-black/40 hover:text-black hover:bg-black/5'
                        }`}
                >
                    <div className={`flex items-center ${collapsedMode ? '' : 'gap-3'}`}>
                        <Icon 
                            size={18} 
                            className={`transition-colors ${active ? 'text-accent-lime' : 'text-black/20 group-hover:text-accent-lime'}`} 
                        />
                        {!collapsedMode && <span>{item.label}</span>}
                    </div>
                    {!collapsedMode && (
                        <ChevronRight 
                            size={14} 
                            className={`transition-transform duration-300 ${isOpen ? 'rotate-90 text-accent-lime' : 'text-black/20'}`} 
                        />
                    )}
                </button>
                
                <div className={`grid transition-all duration-300 ease-in-out ${isOpen && !collapsedMode ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                    <div className="overflow-hidden">
                        <div className="flex flex-col gap-1 ml-4 pl-4 border-l border-black/5">
                            {item.children.map(child => {
                                const childActive = location.pathname === child.path;
                                return (
                                    <Link
                                        key={child.path}
                                        to={child.path}
                                        onClick={() => isMobileOpen && onCloseMobile()}
                                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all
                                            ${childActive 
                                                ? 'text-accent-lime bg-black/5' 
                                                : 'text-black/30 hover:text-black hover:bg-black/5'
                                            }`}
                                    >
                                        {child.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Link
            to={item.path}
            title={collapsedMode ? item.label : ''}
            onClick={() => isMobileOpen && onCloseMobile()}
            className={`flex items-center ${collapsedMode ? 'justify-center' : 'gap-3'} px-4 py-3.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 no-underline group
                ${active
                    ? 'bg-black text-accent-lime shadow-lg shadow-black/10'
                    : 'text-black/40 hover:text-black hover:bg-black/5'
                }`}
        >
            <Icon 
                size={18} 
                className={`shrink-0 transition-colors ${
                    active ? 'text-accent-lime' : 'text-black/20 group-hover:text-accent-lime'
                }`} 
            />
            {!collapsedMode && (
                <span className={`truncate ${active ? 'text-accent-lime' : ''}`}>
                    {item.label}
                </span>
            )}
        </Link>
    );
};

const AdminSidebar = ({ isCollapsed, onToggle, isMobileOpen, onCloseMobile }) => {
    const location = useLocation();
    const { logout } = useAuth();

    return (
        <aside className={`
            ${isMobileOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:translate-x-0'}
            ${isCollapsed && !isMobileOpen ? 'lg:w-[80px]' : 'lg:w-[260px]'}
            bg-white border-r border-black/5 flex flex-col fixed h-screen z-50 transition-all duration-300 overflow-hidden shadow-xl
        `}>
            {/* Header */}
            <div className={`h-[70px] ${isCollapsed && !isMobileOpen ? 'px-2' : 'px-6'} flex items-center justify-between border-b border-black/5`}>
                <div className={`flex items-center gap-3 ${isCollapsed && !isMobileOpen ? 'w-full justify-center' : ''}`}>
                    <span className="font-['Brush_Script_MT',cursive] text-2xl text-accent-lime">TEZA</span>
                    {(!isCollapsed || isMobileOpen) && <span className="text-[10px] font-extrabold bg-black/5 px-1.5 py-0.5 rounded tracking-widest text-black/70">ADMIN</span>}
                </div>
                
                {/* Desktop Toggle */}
                {!isCollapsed && !isMobileOpen && (
                    <button 
                        onClick={onToggle}
                        className="hidden lg:flex w-8 h-8 rounded-lg bg-black/5 items-center justify-center text-black/20 hover:text-black hover:bg-black/10 transition-all"
                    >
                        <ChevronLeft size={16} />
                    </button>
                )}

                {/* Mobile Close Button */}
                {isMobileOpen && (
                    <button 
                        onClick={onCloseMobile}
                        className="lg:hidden w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-black/40 hover:text-black"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {isCollapsed && !isMobileOpen && (
                <div className="hidden lg:flex p-4 border-b border-black/5 justify-center">
                    <button 
                        onClick={onToggle}
                        className="w-10 h-10 rounded-xl bg-accent-lime/10 flex items-center justify-center text-accent-lime hover:bg-accent-lime hover:text-black transition-all shadow-lime"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}

            <nav className="flex-1 px-4 py-8 flex flex-col gap-2 overflow-y-auto no-scrollbar">
                {NAV_ITEMS.map((item) => (
                    <NavItem 
                        key={item.label || item.path}
                        item={item}
                        collapsedMode={isCollapsed && !isMobileOpen}
                        location={location}
                        isMobileOpen={isMobileOpen}
                        onCloseMobile={onCloseMobile}
                    />
                ))}
            </nav>

            <div className={`p-4 border-t border-black/5 bg-black/5 flex flex-col gap-2 ${isCollapsed && !isMobileOpen ? 'items-center' : ''}`}>
                <Link to="/" className={`flex items-center ${isCollapsed && !isMobileOpen ? 'justify-center' : 'gap-2'} text-black/30 text-[11px] font-black uppercase tracking-widest hover:text-accent-lime transition-colors no-underline group px-2 py-1`}>
                    <ArrowLeft size={14} className={`${isCollapsed && !isMobileOpen ? '' : 'group-hover:-translate-x-1'} transition-transform shrink-0`} /> 
                    {(!isCollapsed || isMobileOpen) && <span>Back to Store</span>}
                </Link>
                <button 
                    onClick={() => {
                        logout().then(() => window.location.href = '/admin/login');
                    }}
                    title={isCollapsed ? 'Secure Logout' : ''}
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} text-red-500/50 text-[11px] font-black uppercase tracking-widest hover:text-red-500 transition-colors px-2 py-1 bg-transparent w-full`}
                >
                    <LogOut size={14} className="shrink-0" />
                    {!isCollapsed && <span>Secure Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
