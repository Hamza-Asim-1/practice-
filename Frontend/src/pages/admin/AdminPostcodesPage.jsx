import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
    MapPin, 
    Truck, 
    Wallet, 
    Plus, 
    Trash2, 
    Search,
    Info,
    CheckCircle2,
    ShieldCheck,
    Globe,
    Loader2
} from 'lucide-react';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';

const API_BASE = import.meta.env.VITE_API_BASE;

const AdminPostcodesPage = () => {
    const { user } = useAuth();
    const [postcodes, setPostcodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ code: '', area: '', city: '', deliveryFee: '', minimumOrder: '' });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, code: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchPostcodes = () => {
        setLoading(true);
        fetch(`${API_BASE}/postcodes`, { credentials: 'include' })
            .then(r => r.json())
            .then(d => {
                setPostcodes(Array.isArray(d) ? d : []);
                setLoading(false);
            })
            .catch(() => { setLoading(false); });
    };

    useEffect(() => { fetchPostcodes(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_BASE}/postcodes`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: form.code.toUpperCase().replace(/\s+/g, ''),
                area: form.area,
                city: form.city,
                deliveryFee: Number(form.deliveryFee),
                minimumOrder: Number(form.minimumOrder)
            })
        });

        if (res.ok) {
            const newZone = await res.json();
            // Append the new one locally to avoid a second GET request
            setPostcodes(prev => [newZone, ...prev]);
            setForm({ code: '', area: '', city: '', deliveryFee: '', minimumOrder: '' });
        }
    };

    const handleDelete = async () => {
        const { code } = deleteModal;
        setIsDeleting(true);
        try {
            const res = await fetch(`${API_BASE}/postcodes/${code}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                setPostcodes(prev => prev.filter(pc => pc.code !== code));
                setDeleteModal({ isOpen: false, code: null });
            }
        } catch (error) {
            console.error('Failed to delete postcode:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="admin-page-header flex-col md:flex-row gap-6 md:items-end mb-2 overflow-hidden border-none pb-2">
                <div className="flex-1 min-w-0">
                    <h1 className="admin-page-title text-2xl md:text-3xl">Delivery Areas</h1>
                    <p className="text-black/20 text-[10px] md:text-[11px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                        <Globe size={12} /> {postcodes.length} Serviceable areas currently active
                    </p>
                </div>
            </div>

            <div className="admin-card mb-10 overflow-hidden relative pt-4!">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Truck size={120} />
                </div>
                <div className="relative z-10">
                    <h3 className="text-xs font-black uppercase tracking-widest text-black/40 mb-6 flex items-center gap-2">
                        <Plus size={14} className="text-accent-lime" /> Add New Area
                    </h3>
                    <form onSubmit={handleAdd} className="max-w-4xl space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-black/20 group-focus-within/input:text-accent-lime transition-colors">
                                    <MapPin size={14} />
                                </div>
                                <input 
                                    className="admin-input pl-11! py-3.5 text-xs font-black tracking-tight" 
                                    placeholder="POSTCODE PREFIX (e.g. E1)" 
                                    value={form.code} 
                                    onChange={e => setForm({ ...form, code: e.target.value })} 
                                    required 
                                />
                            </div>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-black/20 group-focus-within/input:text-accent-lime transition-colors">
                                    <Globe size={14} />
                                </div>
                                <input 
                                    className="admin-input pl-11! py-3.5 text-xs font-black tracking-tight" 
                                    placeholder="REGIONAL AREA" 
                                    value={form.area} 
                                    onChange={e => setForm({ ...form, area: e.target.value })} 
                                />
                            </div>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-black/20 group-focus-within/input:text-accent-lime transition-colors">
                                    <Globe size={14} />
                                </div>
                                <input 
                                    className="admin-input pl-11! py-3.5 text-xs font-black tracking-tight" 
                                    placeholder="CITY / MUNICIPALITY" 
                                    value={form.city} 
                                    onChange={e => setForm({ ...form, city: e.target.value })} 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-black/20 group-focus-within/input:text-accent-lime transition-colors">
                                    <Truck size={14} />
                                </div>
                                <input 
                                    className="admin-input pl-11! py-3.5 text-xs font-black tracking-tight" 
                                    placeholder="DELIVERY TARIFF (£)" 
                                    type="number" 
                                    step="0.01" 
                                    value={form.deliveryFee} 
                                    onChange={e => setForm({ ...form, deliveryFee: e.target.value })} 
                                    required 
                                />
                            </div>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-black/20 group-focus-within/input:text-accent-lime transition-colors">
                                    <Wallet size={14} />
                                </div>
                                <input 
                                    className="admin-input pl-11! py-3.5 text-xs font-black tracking-tight" 
                                    placeholder="MINIMUM BASKET (£)" 
                                    type="number" 
                                    step="0.01" 
                                    value={form.minimumOrder} 
                                    onChange={e => setForm({ ...form, minimumOrder: e.target.value })} 
                                    required 
                                />
                            </div>
                            <button type="submit" className="bg-accent-lime rounded-md h-[46px] text-[10px] flex items-center justify-center gap-2 font-black tracking-widest hover:scale-[1.02] active:scale-95 transition-all overflow-hidden whitespace-nowrap">
                                ADD AREA <CheckCircle2 size={16} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="admin-card">
                <div className="flex items-center justify-between mb-8">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-black/20 flex items-center gap-2">
                        <Globe size={12} /> Serviceable Areas
                    </h4>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Postcode</th>
                                <th>Area & City</th>
                                <th>Shipping & Min</th>
                                <th className="hidden lg:table-cell text-right">Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5">
                                        <LoadingSpinner message="Loading areas..." />
                                    </td>
                                </tr>
                            ) : postcodes.length > 0 ? (
                                postcodes.map(pc => (
                                    <tr key={pc.code} className="group/row">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-black text-text-cream italic truncate">{pc.code || 'Unknown'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-col">
                                                <span className="text-[12px] font-black text-text-cream uppercase tracking-wide truncate">
                                                    {pc.area || 'General Coverage'}
                                                </span>
                                                <span className="text-[9px] text-black/30 font-black uppercase tracking-widest">
                                                    {pc.city || 'Region Unspecified'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-col">
                                                <span className="font-black text-xs text-text-cream tracking-widest italic">£{Number(pc.deliveryFee || 0).toFixed(2)}</span>
                                                <span className="text-[9px] text-black/30 font-black uppercase tracking-tighter">Min: £{Number(pc.minimumOrder || 0).toFixed(2)}</span>
                                            </div>
                                        </td>
                                        <td className="hidden lg:table-cell text-right">
                                            <div className="flex items-center justify-end gap-2 text-text-cream font-black">
                                                <span className="w-1.5 h-1.5 rounded-full bg-accent-lime animate-pulse"></span>
                                                <span className="status-badge poultry px-2 py-0.5 text-[8px]">ACTIVE</span>
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <button 
                                                onClick={() => setDeleteModal({ isOpen: true, code: pc.code })}
                                                className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 text-red-500/40 hover:text-white hover:bg-red-500 hover:border-red-500 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-24">
                                        <div className="flex flex-col items-center gap-4 text-black/10 italic">
                                            <Globe size={40} />
                                            <p className="font-medium">No zones added yet. Add a postcode above to start delivering.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <DeleteConfirmModal 
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, code: null })}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                title="Remove Delivery Area"
                message={`Are you sure you want to remove ${deleteModal.code} from serviceable areas? This will prevent customers in this zone from placing orders.`}
            />
        </div>
    );
};

export default AdminPostcodesPage;
