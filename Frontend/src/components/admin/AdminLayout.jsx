import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import { User, Bell, Search, LogOut, Menu } from 'lucide-react';
import RoleGuard from '../auth/RoleGuard';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <RoleGuard allowedRoles={['SUPER_ADMIN', 'OPS_ADMIN']}>
            <div className="flex min-h-screen bg-bg-darker text-text-cream font-['Inter',sans-serif]">
                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div 
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                <AdminSidebar 
                    isCollapsed={isSidebarCollapsed} 
                    isMobileOpen={isMobileMenuOpen}
                    onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                    onCloseMobile={() => setIsMobileMenuOpen(false)}
                />

                {/* Main content — dynamic offset based on sidebar state and screen size */}
                <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[260px]'} ml-0`}>
                    <header className="h-[70px] lg:h-[80px] px-4 lg:px-10 flex justify-between items-center bg-white/80 backdrop-blur-xl border-b border-black/5 sticky top-0 z-30 shadow-sm">
                        <div className="flex items-center gap-4 lg:gap-6">
                            {/* Mobile Toggle Button */}
                            <button 
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="lg:hidden p-2 text-black/40 hover:text-black bg-black/5 rounded-xl transition-all"
                            >
                                <Menu size={20} />
                            </button>

                            <h2 className="text-sm lg:text-xl font-black tracking-tighter text-text-cream uppercase italic truncate">Management Console</h2>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <button className="text-black/30 hover:text-accent-lime transition-colors relative">
                                <Bell size={20} />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent-lime rounded-full shadow-lime" />
                            </button>
                            
                            <div className="flex items-center gap-4 pl-6 border-l border-black/10">
                                <div className="flex flex-col items-end">
                                    <span className="text-[12px] font-black tracking-tight text-text-cream uppercase leading-none mb-1">
                                        {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username || 'System Admin'}
                                    </span>
                                    <span className="text-[9px] font-bold text-black/30 uppercase tracking-widest">
                                        {user?.role?.replace('_', ' ') || 'Guest'} Workspace
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-black/5 border border-black/10 rounded-2xl flex items-center justify-center group cursor-pointer hover:border-accent-lime transition-colors overflow-hidden ring-4 ring-transparent hover:ring-accent-lime/10">
                                        {user?.profileImage ? (
                                            <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} className="text-black/20 group-hover:text-accent-lime transition-colors" />
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => logout().then(() => window.location.href = '/admin/login')}
                                        className="p-3 bg-black/5 border border-black/10 rounded-2xl text-black/20 hover:text-red-500 hover:border-red-500/20 transition-all"
                                        title="Secure Logout"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="p-4 md:pt-4 md:pb-10 md:px-10 flex-1 overflow-hidden">
                        <div className="w-full max-w-[1600px] mx-auto">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </RoleGuard>
    );
};

export default AdminLayout;
