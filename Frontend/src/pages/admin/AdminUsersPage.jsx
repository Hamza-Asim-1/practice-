import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
    ShieldCheck, 
    User, 
    Mail, 
    Calendar, 
    ShieldAlert, 
    Key,
    Lock,
    Unlock,
    Users,
    Search,
    Filter,
    Eye,
    X,
    User as UserIcon,
    Phone,
    Briefcase,
    Shield
} from 'lucide-react';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const API_BASE = import.meta.env.VITE_API_BASE;

const AdminUsersPage = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingUser, setViewingUser] = useState(null);

    const fetchUsers = () => {
        setLoading(true);
        fetch(`${API_BASE}/users`, {
            credentials: 'include'
        })
            .then(r => r.json())
            .then(d => {
                setUsers(Array.isArray(d) ? d : []);
                setLoading(false);
            })
            .catch(() => { setLoading(false); });
    };

    useEffect(() => {
        if (user) fetchUsers();
    }, [user]);

    return (
        <div className="animate-in fade-in duration-500">
            <div className="admin-page-header flex-col md:flex-row gap-6 md:items-end">
                <div className="flex-1">
                    <h1 className="admin-page-title text-2xl md:text-3xl">Users</h1>
                    <p className="text-black/60 text-[10px] md:text-[11px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                        <ShieldCheck size={12} /> Manage user accounts and roles
                    </p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-initial">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            className="bg-black/5 border border-black/10 rounded-xl pl-12 pr-4 py-3 text-xs font-bold text-text-cream focus:border-accent-lime outline-none w-full md:w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="admin-card">
                <div className="flex items-center justify-between mb-8">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-black/20 flex items-center gap-2">
                        <ShieldCheck size={12} /> User Permissions
                    </h4>
                </div>

                <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User Email</th>
                                <th className="hidden sm:table-cell">Role</th>
                                <th className="hidden lg:table-cell">Joined</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4">
                                        <LoadingSpinner message="Loading users..." />
                                    </td>
                                </tr>
                            ) : users.length > 0 ? (
                                users.map(u => (
                                    <tr key={u.id} className="group/row">
                                        <td>
                                            <div className="flex items-center gap-4">
                                                <div className="hidden xs:flex w-10 h-10 rounded-xl bg-black/5 border border-black/5 items-center justify-center group-hover/row:bg-accent-lime/10 group-hover/row:border-accent-lime/20 transition-all shrink-0">
                                                    <User size={18} className="text-black/20 group-hover/row:text-accent-lime transition-colors" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[12px] md:text-[13px] font-black text-text-cream italic truncate">
                                                        {u.email || 'anonymous@entity.com'}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] text-black/20 font-mono tracking-widest uppercase">
                                                            {u.id?.slice(0, 8) || 'SIGNAL-ERR'}
                                                        </span>
                                                        <span className="sm:hidden">
                                                            {u.role === 'SUPER_ADMIN' ? (
                                                                <span className="text-[8px] text-red-500 font-black tracking-tighter">Admin</span>
                                                            ) : u.role === 'OPS_ADMIN' ? (
                                                                <span className="text-[8px] text-black/40 font-black tracking-tighter">Ops</span>
                                                            ) : u.role === 'SUPPLIER_ADMIN' ? (
                                                                <span className="text-[8px] text-black/40 font-black tracking-tighter">Supplier</span>
                                                            ) : (
                                                                <span className="text-[8px] text-black/40 font-black tracking-tighter">User</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hidden sm:table-cell">
                                            <div className="flex items-center gap-2">
                                                {u.role === 'SUPER_ADMIN' ? (
                                                    <span className="status-badge beef flex items-center gap-1.5 px-2 py-0.5 truncate"><Lock size={8} /> Super Admin</span>
                                                ) : u.role === 'OPS_ADMIN' ? (
                                                    <span className="status-badge poultry flex items-center gap-1.5 px-2 py-0.5 truncate"><ShieldAlert size={8} /> Operations</span>
                                                ) : u.role === 'SUPPLIER_ADMIN' ? (
                                                    <span className="status-badge poultry flex items-center gap-1.5 px-2 py-0.5 truncate"><Shield size={8} /> Supplier</span>
                                                ) : u.role === 'CUSTOMER' ? (
                                                    <span className="status-badge veal flex items-center gap-1.5 px-2 py-0.5 truncate"><User size={8} /> Customer</span>
                                                ) : (
                                                    <span className="status-badge veal flex items-center gap-1.5 px-2 py-0.5 truncate"><User size={8} /> {u.role || 'Guest'}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="hidden lg:table-cell">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-black/40 uppercase tracking-tighter">
                                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {(u.role === 'CUSTOMER' || u.role === 'SUPPLIER_ADMIN') && (
                                                    <button 
                                                        onClick={() => setViewingUser(u)}
                                                        title="View User Profile"
                                                        className="h-8 w-8 rounded-lg bg-black/5 border border-black/5 text-black/40 hover:text-text-cream hover:bg-black/10 transition-all flex items-center justify-center shrink-0"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                )}
                                                {u.role !== 'SUPER_ADMIN' ? (
                                                    <button className="h-8 w-8 rounded-lg bg-red-500/5 border border-red-500/10 text-red-500/40 hover:text-white hover:bg-red-500 transition-all flex items-center justify-center shrink-0">
                                                        <ShieldAlert size={14} />
                                                    </button>
                                                ) : (
                                                    <span className="px-2 py-1 rounded-lg bg-accent-lime/10 text-accent-lime text-[8px] font-black tracking-widest uppercase border border-accent-lime/20 shrink-0">ROOT</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-20 text-black/10 italic">No system identities detected.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Dossier Modal */}
            {viewingUser && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingUser(null)}></div>
                    <div className="bg-white border border-black/10 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/10 w-full max-w-lg relative z-101 animate-in zoom-in duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-accent-lime/10 flex items-center justify-center text-accent-lime">
                                    <ShieldCheck size={20} />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-text-cream m-0">User Profile</h3>
                            </div>
                            <button onClick={() => setViewingUser(null)} className="text-black/20 hover:text-text-cream transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-black/5 border border-black/5 rounded-2xl p-6">
                                <label className="text-[9px] font-black uppercase tracking-widest text-black/60 block mb-2">Primary Identity</label>
                                <div className="flex items-center gap-4">
                                    <p className="text-xl font-black tracking-tight text-text-cream m-0 italic">{viewingUser.email}</p>
                                    <span className="text-[10px] text-black/60 font-mono tracking-widest uppercase bg-accent-lime/60 px-2 py-1 rounded-md">{viewingUser.id.slice(0, 8)}</span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-black/5">
                                    <div>
                                        <label className="text-[9px] font-black uppercase tracking-widest text-black/60 block mb-1">Access Level</label>
                                        <div className="mt-1">
                                            {viewingUser.role === 'SUPER_ADMIN' ? (
                                                <span className="status-badge beef text-[9px]">Super Admin</span>
                                            ) : viewingUser.role === 'OPS_ADMIN' ? (
                                                <span className="status-badge poultry text-[9px]">Operations</span>
                                            ) : viewingUser.role === 'SUPPLIER_ADMIN' ? (
                                                <span className="status-badge poultry text-[9px]">Supplier</span>
                                            ) : viewingUser.role === 'CUSTOMER' ? (
                                                <span className="status-badge veal text-[9px]">Customer</span>
                                            ) : (
                                                <span className="status-badge veal text-[9px]">{viewingUser.role || 'Standard'}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black uppercase tracking-widest text-black/60 block mb-1">Joined</label>
                                        <p className="text-[11px] font-bold text-black/60 m-0 uppercase tracking-tighter">
                                            {new Date(viewingUser.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Role-Specific Details */}
                            {viewingUser.role === 'CUSTOMER' && viewingUser.customer && (
                                <div className="bg-black/5 border border-black/5 rounded-2xl p-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-4 flex items-center gap-2">
                                        <UserIcon size={12} /> Customer Details
                                    </h4>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-black/10 block mb-1">Full Name</label>
                                            <p className="text-[13px] font-black text-text-cream m-0">{viewingUser.customer.firstName} {viewingUser.customer.lastName}</p>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-black/10 block mb-1">Phone Number</label>
                                            <p className="text-[13px] font-black text-text-cream m-0 flex items-center gap-2">
                                                <Phone size={10} className="text-accent-lime" /> {viewingUser.customer.phone || "Not Set"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {viewingUser.role === 'SUPPLIER_ADMIN' && viewingUser.supplier && (
                                <div className="bg-black/5 border border-black/5 rounded-2xl p-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-black/60 mb-4 flex items-center gap-2">
                                        <Briefcase size={12} /> Supplier Details
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-black/60 block mb-1">Business Name</label>
                                            <p className="text-[15px] font-black text-text-cream m-0 italic">{viewingUser.supplier.name}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/5">
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest text-black/60 block mb-1">Contact Person</label>
                                                <p className="text-[12px] font-bold text-black/60 m-0">{viewingUser.supplier.contactName}</p>
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest text-black/60 block mb-1">Status</label>
                                                <span className={`status-badge text-[8px] ${viewingUser.supplier.status === 'ACTIVE' ? 'beef' : 'veal'}`}>
                                                    {viewingUser.supplier.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!viewingUser.customer && !viewingUser.supplier && viewingUser.role !== 'SUPER_ADMIN' && (
                                <div className="p-8 border border-dashed border-black/10 rounded-2xl text-center">
                                    <p className="text-[11px] font-bold text-black/20 uppercase tracking-widest m-0 flex items-center justify-center gap-2">
                                        <Shield size={12} /> No Linked Profile Data Detected
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button 
                                onClick={() => setViewingUser(null)}
                                className="px-6 py-2.5 rounded-xl bg-black/5 border border-black/10 text-[10px] font-black uppercase tracking-widest text-text-cream hover:bg-black/10 transition-all"
                            >
                                Close Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;
