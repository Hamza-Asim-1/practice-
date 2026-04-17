import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Edit3, 
    Trash2, 
    Tag, 
    Database,
    ChevronRight,
    X,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Tooltip from '../../components/common/Tooltip';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';

const API_BASE = import.meta.env.VITE_API_BASE;

const AdminCategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form state
    const [form, setForm] = useState({ name: '', description: '' });
    const [editingId, setEditingId] = useState(null);
    
    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/categories`);
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            const url = editingId ? `${API_BASE}/categories/${editingId}` : `${API_BASE}/categories`;
            const method = editingId ? 'PATCH' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form)
            });
            
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Action failed');
            }
            
            toast.success(editingId ? 'Category updated' : 'Category created');
            setForm({ name: '', description: '' });
            setEditingId(null);
            fetchCategories();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        const { id } = deleteModal;
        setIsSaving(true);
        
        try {
            const res = await fetch(`${API_BASE}/categories/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Deletion failed');
            }
            
            toast.success('Category removed');
            setDeleteModal({ isOpen: false, id: null });
            fetchCategories();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const startEdit = (cat) => {
        setEditingId(cat.id);
        setForm({ name: cat.name, description: cat.description || '' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm({ name: '', description: '' });
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="admin-page-header">
                <div className="flex-1">
                    <h1 className="admin-page-title text-2xl md:text-3xl">Categories</h1>
                    <p className="text-black/60 text-[10px] md:text-[11px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                        <Tag size={12} /> Organize your products
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-8">
                {/* Creation/Edit Form */}
                <div className="w-full">
                    <div className={`admin-card border-l-4 transition-colors ${editingId ? 'border-l-blue-500' : 'border-l-accent-lime'}`}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${editingId ? 'bg-blue-500/10 text-blue-500' : 'bg-accent-lime/10 text-accent-lime'}`}>
                                    {editingId ? <Edit3 size={20} /> : <Plus size={20} />}
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-text-cream m-0">
                                    {editingId ? 'Refine Category' : 'Initialize Category'}
                                </h3>
                            </div>
                            {editingId && (
                                <button 
                                    onClick={cancelEdit}
                                    className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-black/40 hover:text-black hover:bg-black/10 transition-all"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-end">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block">Identity</label>
                                <input 
                                    className="admin-input w-full" 
                                    placeholder="Category Name" 
                                    value={form.name} 
                                    onChange={e => setForm({ ...form, name: e.target.value.toUpperCase() })} 
                                    required 
                                />
                                <p className="text-[9px] text-black/40 mt-1 italic">Will be converted to UPPERCASE</p>
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block">Description (Optional)</label>
                                <textarea 
                                    className="admin-input w-full min-h-[46px] py-3 resize-none" 
                                    placeholder="Brief definition of this category..." 
                                    value={form.description} 
                                    onChange={e => setForm({ ...form, description: e.target.value })} 
                                />
                            </div>

                            <div>
                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className={`${editingId ? 'bg-blue-500' : 'bg-accent-lime'} rounded-xl w-full py-4 group disabled:opacity-50`}
                                >
                                    <span className={`flex items-center justify-center gap-2 ${editingId ? 'text-white' : ''}`}>
                                        {isSaving ? 'Saving...' : editingId ? 'Update Category' : 'Save Category'}
                                        {!isSaving && <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Categories Table */}
                <div className="w-full">
                    <div className="admin-card">
                        {loading ? (
                            <LoadingSpinner message="Loading categories..." />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Category Name</th>
                                            <th>Description</th>
                                            <th className="text-center">Products</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map(cat => (
                                            <tr key={cat.id} className="group/row">
                                                <td>
                                                    <div className="flex flex-col">
                                                        <span className="text-[13px] font-black text-text-cream group-hover/row:text-accent-lime transition-colors">
                                                            {cat.name || 'Unnamed classification'}
                                                        </span>
                                                        <span className="text-[9px] text-black/20 uppercase tracking-widest font-bold">
                                                            ID-{cat.id?.slice(0, 8) || 'SIGNAL-ERR'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <p className="text-[11px] text-black/60 line-clamp-1 max-w-md">
                                                        {cat.description || <span className="italic text-black/20">No description provided</span>}
                                                    </p>
                                                </td>
                                                <td className="text-center font-black text-xs text-black/40">
                                                    {/* Total products would be ideal here if backend provided it */}
                                                    <span className="bg-black/5 px-2 py-0.5 rounded text-[10px]">Registry Active</span>
                                                </td>
                                                <td className="text-right">
                                                    <div className="flex items-center justify-end gap-2 pr-2">
                                                        <Tooltip text="Edit Definition">
                                                            <button 
                                                                onClick={() => startEdit(cat)}
                                                                className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-black/30 hover:text-blue-500 hover:bg-blue-500/10 transition-all"
                                                            >
                                                                <Edit3 size={14} />
                                                            </button>
                                                        </Tooltip>
                                                        <Tooltip text="Purge Node">
                                                            <button 
                                                                onClick={() => setDeleteModal({ isOpen: true, id: cat.id })}
                                                                className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-black/30 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </Tooltip>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {categories.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="text-center py-20 text-black/20 italic">No categories defined in the registry.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <DeleteConfirmModal 
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                isLoading={isSaving}
                title="Purge Category"
                message="Are you sure you want to remove this category? This will affect all products currently classified under this node."
            />
        </div>
    );
};

export default AdminCategoriesPage;
